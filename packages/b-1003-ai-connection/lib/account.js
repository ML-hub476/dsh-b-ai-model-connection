/**
 * B-1003 — whose grant is this?
 *
 * The card knows two things about a provider: whether a credential record
 * exists, and nothing about who it belongs to. "Signed in" is therefore a fact
 * about this Mac, not about an account, and a person with one Claude login and
 * one ChatGPT login on the same address cannot tell from the card which
 * subscription a model request will spend.
 *
 * Answering "which account" needs the account's own name, which neither
 * provider puts in the record. There are exactly two mechanisms, one per
 * provider family, and this module is the whole of them:
 *
 *   - OpenAI Codex stores a JWT. Its claims name the account
 *     (`https://api.openai.com/profile`.email) and the plan it is billed on
 *     (`https://api.openai.com/auth`.chatgpt_plan_type), so the answer is read
 *     locally, with no request and no round trip.
 *   - Anthropic stores an opaque `sk-ant-oat01-…` bearer token. Nothing about
 *     an account can be read out of those bytes, so the answer costs one HTTPS
 *     request to the same profile endpoint the Claude CLI uses for `/status`.
 *
 * The token is never returned, logged, or put in a message: it goes into an
 * `Authorization` header and nowhere else. Callers get a name, a plan, and an
 * error code — see `readAccount`.
 *
 * No cache, no timers, no plugin context, no imports. `index.js` owns the
 * caching and the route, which is what lets this file be exercised from a plain
 * `node` prompt against a real record.
 */

const PROFILE_URL = 'https://api.anthropic.com/api/oauth/profile'
const PROFILE_TIMEOUT_MS = 10_000
const PROFILE_MAX_CHARS = 256 * 1024

/** JWT claim namespaces. Both are registered URIs, not ours to rename. */
const CLAIM_AUTH = 'https://api.openai.com/auth'
const CLAIM_PROFILE = 'https://api.openai.com/profile'

/**
 * Plan ids in the two providers' own vocabulary, and the name a person
 * recognises. An unknown id falls through to a tidied version of itself, so a
 * plan added upstream still reads as something rather than as blank.
 */
const PLAN_NAMES = {
  'openai-codex': {
    free: 'ChatGPT Free',
    plus: 'ChatGPT Plus',
    pro: 'ChatGPT Pro',
    team: 'ChatGPT Team',
    business: 'ChatGPT Business',
    enterprise: 'ChatGPT Enterprise',
  },
  anthropic: {
    claude_free: 'Claude Free',
    claude_pro: 'Claude Pro',
    claude_max: 'Claude Max',
    claude_team: 'Claude Team',
    claude_enterprise: 'Claude Enterprise',
  },
}

function objectOf(value) {
  return value !== null && typeof value === 'object' && Array.isArray(value) === false ? value : undefined
}

function textOf(value, limit = 200) {
  if (typeof value !== 'string') return ''
  const trimmed = value.trim()
  return trimmed.length > limit ? trimmed.slice(0, limit) : trimmed
}

/**
 * The payload of a JWT, or `undefined` when the value is not one.
 *
 * Decoding is not verification: nothing here checks the signature, because the
 * question is "who does this token claim to be", and the token came from the
 * credential store the provider flow wrote, not from the network.
 */
export function jwtClaims(token) {
  if (typeof token !== 'string') return undefined
  const parts = token.split('.')
  if (parts.length !== 3 || parts[1].length === 0) return undefined
  try {
    const json = Buffer.from(parts[1], 'base64url').toString('utf8')
    return objectOf(JSON.parse(json))
  } catch {
    return undefined
  }
}

/** `claude_pro` → `Claude Pro`, and anything unrecognised → `Claude Pro`-ish. */
export function planName(family, planId) {
  const id = textOf(planId, 100)
  if (id.length === 0) return ''
  const known = PLAN_NAMES[family]?.[id]
  if (known !== undefined) return known
  const tidied = id
    .replace(/^claude_/, '')
    .split(/[_-]/)
    .filter((word) => word.length > 0)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ')
  return tidied.length === 0 ? id : tidied
}

function accountOk(family, fields) {
  const email = textOf(fields.email)
  const planId = textOf(fields.planId, 100)
  if (email.length === 0 && planId.length === 0) return { error: { code: 'unreadable' } }
  const account = { email, planId, plan: planName(family, planId) }
  const name = textOf(fields.name)
  if (name.length > 0) account.name = name
  if (Number.isFinite(fields.expiresAt) && fields.expiresAt > 0) account.expiresAt = fields.expiresAt
  return account
}

/**
 * The identity a JWT carries.
 *
 * Email and display name live in the profile namespace, the plan in the auth
 * namespace. A token minted before either namespace existed still answers with
 * whatever it does carry, or with `unreadable` when it carries neither.
 */
function accountFromClaims(claims) {
  const auth = objectOf(claims[CLAIM_AUTH])
  const profile = objectOf(claims[CLAIM_PROFILE])
  return accountOk('openai-codex', {
    email: profile?.email ?? auth?.email,
    name: profile?.name,
    planId: auth?.chatgpt_plan_type,
    expiresAt: Number.isFinite(claims.exp) ? claims.exp * 1000 : undefined,
  })
}

function planIdFromProfile(account, organization) {
  if (account.has_claude_max === true) return 'claude_max'
  if (account.has_claude_pro === true) return 'claude_pro'
  // `organization_type` is the same tier under the organization's name
  // (`claude_pro`, `claude_max`, `claude_team`, `claude_enterprise`).
  return textOf(organization.organization_type, 100)
}

async function readCapped(response, limit) {
  const text = await response.text()
  return text.length > limit ? text.slice(0, limit) : text
}

/**
 * The identity an opaque Anthropic token belongs to.
 *
 * One GET to the OAuth profile endpoint, with the three headers the Claude CLI
 * itself sends. A 401 is a dead token, a 403 is a live token without the
 * `user:profile` scope — two different things to tell a person, so they stay
 * two different codes. The request carries the token in a header and the
 * response body never leaves this function.
 */
async function accountFromProfile(token, payload, options) {
  const doFetch = typeof options.fetch === 'function' ? options.fetch : globalThis.fetch
  if (typeof doFetch !== 'function') return { error: { code: 'offline' } }
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(new Error('The profile lookup took too long.')), PROFILE_TIMEOUT_MS)
  timer.unref?.()
  try {
    const response = await doFetch(PROFILE_URL, {
      method: 'GET',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
        'cache-control': 'no-cache',
      },
      signal: controller.signal,
    })
    if (response.status === 401) return { error: { code: 'rejected' } }
    if (response.status === 403) return { error: { code: 'forbidden' } }
    if (response.status !== 200) return { error: { code: 'http', status: response.status } }

    let body
    try {
      body = JSON.parse(await readCapped(response, PROFILE_MAX_CHARS))
    } catch {
      return { error: { code: 'unreadable' } }
    }
    const account = objectOf(body?.account)
    const organization = objectOf(body?.organization)
    if (account === undefined) return { error: { code: 'unreadable' } }

    return accountOk('anthropic', {
      email: account.email,
      name: account.full_name ?? account.display_name,
      planId: planIdFromProfile(account, organization ?? {}),
      expiresAt: Number.isFinite(payload?.expires) ? payload.expires : undefined,
    })
  } catch {
    return { error: { code: 'offline' } }
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Who holds this grant.
 *
 * `provider` decides which mechanism applies; `payload` is the `grant` record's
 * payload exactly as the credential store returns it — `{ type, access,
 * refresh, expires, … }`. The answer is either an account (`{ email, name?,
 * plan, planId, expiresAt? }`) or `{ error: { code, status? } }`, where `code`
 * is one of `rejected`, `forbidden`, `offline`, `http`, `unreadable`. Nothing
 * here throws: a card that cannot name the account still has a working sign-in
 * to report.
 *
 * A token that is neither a JWT nor Anthropic's own prefix is answered locally
 * rather than by sending somebody else's bearer token to Anthropic's profile
 * endpoint — a provider added later may store an opaque token too, and that
 * token has no business leaving this Mac.
 *
 * `options.fetch` exists so a test can answer without the network; production
 * passes nothing and gets the global `fetch`.
 */
export async function readAccount(provider, payload, options = {}) {
  const token = typeof payload?.access === 'string' ? payload.access : ''
  if (token.length === 0) return { error: { code: 'unreadable' } }
  const claims = jwtClaims(token)
  if (claims !== undefined) return accountFromClaims(claims)
  if (provider !== 'anthropic' && token.startsWith('sk-ant-') === false) return { error: { code: 'unreadable' } }
  return accountFromProfile(token, payload, options)
}
