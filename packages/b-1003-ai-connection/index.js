/**
 * B-1003 AI Connection — the Host half.
 *
 * The subscription sign-in itself belongs to `@deepseek-ai/dsh-llm-pi-ai`:
 * that plugin registers one authorization flow per installed pi-ai provider
 * and stores the resulting token in the Harness credential store at
 * `llm-pi-ai/<provider>`. This plugin adds the missing surface:
 *
 *   - a small HTTP bridge under `/b-1003` that starts one flow, relays its
 *     notices and questions to the browser, and accepts the answers;
 *   - `client.js`, which draws the sign-in controls on the Models page.
 *
 * Nothing here reads, writes, or logs a token. The only write is the final
 * `deleteRecord` that "Sign out" performs through the credential seam.
 */

const ROUTE_PREFIX = '/b-1003'
const RECORD_SCOPE = 'llm-pi-ai'
const KEY_PREFIX = `${RECORD_SCOPE}/`
const REQUEST_HEADER = 'x-dsh-b-1003'
const MAX_BODY_BYTES = 64 * 1024
const ATTEMPT_TIMEOUT_MS = 10 * 60 * 1000
const ATTEMPT_KEEP_MS = 60 * 1000
const PROVIDER_PATTERN = /^[a-z0-9][a-z0-9-]*$/

class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

function messageOf(error) {
  return error instanceof Error && error.message.length > 0 ? error.message : String(error)
}

/** Keep only a web page address; anything else is dropped rather than rendered. */
function httpUrl(value) {
  if (typeof value !== 'string' || value.length === 0) return undefined
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : undefined
  } catch {
    return undefined
  }
}

function textOf(value, limit = 4000) {
  return typeof value === 'string' ? value.slice(0, limit) : ''
}

export function apply(ctx) {
  /** provider id -> in-flight or recently finished attempt */
  const attempts = new Map()

  function authorization() {
    const service = ctx.get('authorization')
    if (service === undefined) {
      throw new HttpError(503, 'This Harness build has no authorization service, so provider sign-in is unavailable.')
    }
    return service
  }

  function credentials() {
    const service = ctx.get('credentials')
    if (service === undefined) {
      throw new HttpError(503, 'This Harness build has no credential store, so a sign-in cannot be saved.')
    }
    return service
  }

  function entryFor(provider) {
    if (!PROVIDER_PATTERN.test(provider)) return undefined
    const rawKey = `${KEY_PREFIX}${provider}`
    return authorization().list().find((entry) => String(entry.key) === rawKey)
  }

  function providerOf(entry) {
    const rawKey = String(entry?.key ?? '')
    if (!rawKey.startsWith(KEY_PREFIX)) return undefined
    const provider = rawKey.slice(KEY_PREFIX.length)
    return PROVIDER_PATTERN.test(provider) ? provider : undefined
  }

  function oauthMethod(entry) {
    return entry?.methods?.find((method) => method.id === 'oauth')
  }

  function activeRouteIds() {
    const llm = ctx.get('llm')
    if (llm === undefined || typeof llm.listProviders !== 'function') return new Set()
    try {
      return new Set(llm.listProviders().map((info) => info.id))
    } catch {
      return new Set()
    }
  }

  async function recordState(key) {
    const store = ctx.get('credentials')
    if (store === undefined) return { signedIn: false, writable: false }
    try {
      const record = await store.describeRecord(key)
      return { signedIn: record.configured === true, writable: record.writable === true }
    } catch {
      return { signedIn: false, writable: false }
    }
  }

  async function status() {
    const auth = ctx.get('authorization')
    if (auth === undefined) return { providers: {} }
    const routes = activeRouteIds()
    const providers = {}
    for (const entry of auth.list()) {
      const provider = providerOf(entry)
      if (provider === undefined) continue
      const oauth = oauthMethod(entry)
      if (oauth === undefined) continue
      const record = await recordState(entry.key)
      providers[provider] = {
        provider,
        label: textOf(entry.label, 200),
        signInLabel: textOf(oauth.label, 200) || textOf(entry.label, 200),
        signedIn: record.signedIn,
        writable: record.writable,
        active: attempts.get(provider)?.active === true,
        routeActive: routes.has(provider),
      }
    }
    return { providers }
  }

  function push(attempt, frame) {
    attempt.frames.push(frame)
  }

  function wirePrompt(promptId, prompt) {
    const frame = {
      promptId,
      kind: prompt.kind === 'select' ? 'select' : prompt.kind === 'secret' ? 'secret' : 'text',
      message: textOf(prompt.message, 2000),
    }
    if (typeof prompt.placeholder === 'string' && prompt.placeholder.length > 0) {
      frame.placeholder = textOf(prompt.placeholder, 300)
    }
    if (Array.isArray(prompt.options)) {
      frame.options = prompt.options.map((option) => ({
        id: textOf(option?.id, 300),
        label: textOf(option?.label, 300),
        ...(typeof option?.description === 'string' && option.description.length > 0
          ? { description: textOf(option.description, 500) }
          : {}),
      }))
    }
    return frame
  }

  function ask(attempt, prompt) {
    if (attempt.controller.signal.aborted) return Promise.reject(new Error('The sign-in was cancelled.'))
    if (prompt?.signal?.aborted) return Promise.reject(new Error('That question was withdrawn.'))
    if (attempt.prompt !== undefined) {
      return Promise.reject(new Error('The provider asked two questions at the same time.'))
    }
    const promptId = `${attempt.provider}-${++attempt.serial}`
    return new Promise((resolve, reject) => {
      const finish = () => {
        prompt?.signal?.removeEventListener('abort', onAbort)
        if (attempt.prompt?.id === promptId) attempt.prompt = undefined
        push(attempt, { type: 'prompt-withdrawn', promptId })
      }
      const onAbort = () => {
        finish()
        reject(new Error('That question was withdrawn.'))
      }
      attempt.prompt = {
        id: promptId,
        resolve(value) {
          finish()
          resolve(value)
        },
        reject(reason) {
          finish()
          reject(reason)
        },
      }
      prompt?.signal?.addEventListener('abort', onAbort, { once: true })
      push(attempt, { type: 'prompt', prompt: wirePrompt(promptId, prompt) })
    })
  }

  async function run(attempt, entry) {
    const auth = authorization()
    try {
      const outcome = await auth.begin({
        key: entry.key,
        method: 'oauth',
        signal: attempt.controller.signal,
        interaction: {
          notify(notice) {
            const frame = { type: 'notice', message: textOf(notice?.message, 2000) }
            const url = httpUrl(notice?.url)
            if (url !== undefined) frame.url = url
            const code = textOf(notice?.code, 200)
            if (code.length > 0) frame.code = code
            push(attempt, frame)
          },
          prompt(prompt) {
            return ask(attempt, prompt)
          },
        },
      })
      attempt.settled = outcome?.status === 'authorized' ? 'authorized' : 'cancelled'
      push(attempt, { type: 'settled', status: attempt.settled })
    } catch (error) {
      if (attempt.controller.signal.aborted) {
        attempt.settled = 'cancelled'
        push(attempt, { type: 'settled', status: 'cancelled' })
      } else {
        attempt.settled = 'failed'
        push(attempt, { type: 'failed', message: messageOf(error) })
      }
    } finally {
      attempt.active = false
      clearTimeout(attempt.timer)
      const pending = attempt.prompt
      attempt.prompt = undefined
      pending?.reject(new Error('The sign-in finished.'))
      attempt.keepTimer = setTimeout(() => {
        if (attempts.get(attempt.provider) === attempt) attempts.delete(attempt.provider)
      }, ATTEMPT_KEEP_MS)
      attempt.keepTimer.unref?.()
    }
  }

  async function start(rawProvider) {
    const provider = typeof rawProvider === 'string' ? rawProvider : ''
    const entry = entryFor(provider)
    if (entry === undefined) throw new HttpError(404, 'This provider has no sign-in flow in this install.')
    if (oauthMethod(entry) === undefined) {
      throw new HttpError(400, 'This provider offers no subscription sign-in; add an API key instead.')
    }
    const existing = attempts.get(provider)
    if (existing?.active === true) {
      return { attempt: provider, since: existing.frames.length, active: true }
    }
    const attempt = {
      provider,
      key: entry.key,
      controller: new AbortController(),
      frames: [],
      active: true,
      prompt: undefined,
      serial: 0,
      settled: undefined,
      timer: undefined,
      keepTimer: undefined,
    }
    attempts.set(provider, attempt)
    attempt.timer = setTimeout(() => cancelAttempt(attempt, 'The sign-in took too long.'), ATTEMPT_TIMEOUT_MS)
    attempt.timer.unref?.()
    void run(attempt, entry)
    return { attempt: provider, since: 0, active: true }
  }

  function cancelAttempt(attempt, reason) {
    if (!attempt.active) return false
    attempt.controller.abort(new Error(reason))
    try {
      authorization().cancel(attempt.key)
    } catch {
      /* the flow may already have settled */
    }
    const pending = attempt.prompt
    attempt.prompt = undefined
    pending?.reject(new Error(reason))
    return true
  }

  async function cancel(rawProvider) {
    const provider = typeof rawProvider === 'string' ? rawProvider : ''
    if (entryFor(provider) === undefined) throw new HttpError(404, 'This provider has no sign-in flow in this install.')
    const attempt = attempts.get(provider)
    if (attempt === undefined) return { ok: true, active: false }
    const cancelled = cancelAttempt(attempt, 'The sign-in was cancelled.')
    return { ok: true, active: cancelled }
  }

  async function answer(rawProvider, rawPromptId, rawValue) {
    const provider = typeof rawProvider === 'string' ? rawProvider : ''
    const promptId = typeof rawPromptId === 'string' ? rawPromptId : ''
    if (entryFor(provider) === undefined) throw new HttpError(404, 'This provider has no sign-in flow in this install.')
    const attempt = attempts.get(provider)
    if (attempt === undefined || !attempt.active) {
      throw new HttpError(409, 'No sign-in is running for this provider.')
    }
    if (attempt.prompt?.id !== promptId) {
      throw new HttpError(409, 'That question is no longer waiting for an answer.')
    }
    if (typeof rawValue !== 'string') throw new HttpError(400, 'The answer must be a string.')
    if (rawValue.length === 0) throw new HttpError(400, 'The answer is empty.')
    attempt.prompt.resolve(rawValue)
    return { ok: true }
  }

  async function signOut(rawProvider) {
    const provider = typeof rawProvider === 'string' ? rawProvider : ''
    const entry = entryFor(provider)
    if (entry === undefined) throw new HttpError(404, 'This provider has no sign-in flow in this install.')
    const attempt = attempts.get(provider)
    if (attempt?.active === true) cancelAttempt(attempt, 'The account was signed out.')
    await credentials().deleteRecord(entry.key)
    return { ok: true, signedIn: false }
  }

  async function events(rawProvider, rawSince) {
    const provider = typeof rawProvider === 'string' ? rawProvider : ''
    if (!PROVIDER_PATTERN.test(provider)) throw new HttpError(400, 'Unknown provider.')
    const entry = entryFor(provider)
    if (entry === undefined) throw new HttpError(404, 'This provider has no sign-in flow in this install.')
    const attempt = attempts.get(provider)
    const record = await recordState(entry.key)
    if (attempt === undefined) {
      return { frames: [], since: 0, active: false, signedIn: record.signedIn, settled: undefined }
    }
    const wanted = Number.parseInt(String(rawSince ?? '0'), 10)
    const since = Number.isFinite(wanted) && wanted > 0 ? Math.min(wanted, attempt.frames.length) : 0
    return {
      frames: attempt.frames.slice(since),
      since: attempt.frames.length,
      active: attempt.active === true,
      signedIn: record.signedIn,
      settled: attempt.settled,
    }
  }

  function sendJson(response, statusCode, value) {
    const body = JSON.stringify(value)
    response.writeHead(statusCode, {
      'content-type': 'application/json; charset=utf-8',
      'content-length': Buffer.byteLength(body),
      'cache-control': 'no-store',
    })
    response.end(body)
  }

  async function readJson(request) {
    const chunks = []
    let size = 0
    for await (const chunk of request) {
      size += chunk.length
      if (size > MAX_BODY_BYTES) throw new HttpError(413, 'The request body is too large.')
      chunks.push(chunk)
    }
    if (chunks.length === 0) return {}
    try {
      return JSON.parse(Buffer.concat(chunks).toString('utf8'))
    } catch {
      throw new HttpError(400, 'The request body is not valid JSON.')
    }
  }

  async function handle(request, response) {
    if (request.headers[REQUEST_HEADER] !== '1') {
      return sendJson(response, 403, { error: 'This endpoint only answers the B-1003 sign-in surface.' })
    }
    const url = new URL(request.url ?? '/', 'http://127.0.0.1')
    const path = url.pathname.slice(ROUTE_PREFIX.length) || '/'
    const method = request.method ?? 'GET'
    try {
      if (method === 'GET' && path === '/status') return sendJson(response, 200, await status())
      if (method === 'GET' && path === '/events') {
        return sendJson(
          response,
          200,
          await events(url.searchParams.get('provider') ?? '', url.searchParams.get('since') ?? '0'),
        )
      }
      if (method === 'POST' && path === '/sign-in') {
        const body = await readJson(request)
        return sendJson(response, 200, await start(body?.provider))
      }
      if (method === 'POST' && path === '/answer') {
        const body = await readJson(request)
        return sendJson(response, 200, await answer(body?.provider, body?.promptId, body?.value))
      }
      if (method === 'POST' && path === '/cancel') {
        const body = await readJson(request)
        return sendJson(response, 200, await cancel(body?.provider))
      }
      if (method === 'POST' && path === '/sign-out') {
        const body = await readJson(request)
        return sendJson(response, 200, await signOut(body?.provider))
      }
      return sendJson(response, 404, { error: `Unknown path ${method} ${path}` })
    } catch (error) {
      const statusCode = error instanceof HttpError ? error.status : 400
      return sendJson(response, statusCode, { error: messageOf(error) })
    }
  }

  ctx.inject(['webServer'], (childCtx) => {
    const server = childCtx.get('webServer')
    if (server === undefined) return
    childCtx.effect(
      () => server.register({ kind: 'prefix', path: ROUTE_PREFIX, handler: handle }),
      'b-1003: sign-in endpoints',
    )
  })

  ctx.effect(
    () => () => {
      for (const attempt of attempts.values()) {
        clearTimeout(attempt.timer)
        clearTimeout(attempt.keepTimer)
        attempt.controller.abort(new Error('The plugin was unloaded.'))
        const pending = attempt.prompt
        attempt.prompt = undefined
        pending?.reject(new Error('The plugin was unloaded.'))
      }
      attempts.clear()
    },
    'b-1003: close sign-in attempts',
  )
}
