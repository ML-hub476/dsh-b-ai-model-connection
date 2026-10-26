window.__ModuleLoader__.load({
  id: '@ml-hub476/b-1003-ai-connection',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const { useCallback, useEffect, useRef, useState } = React

    const PACKAGE_ID = 'B-1003'
    const PROVIDER_NS = 'llm-pi-ai'
    const API = '/b-1003'

    const COPY = {
      en: {
        title: 'Claude / ChatGPT account',
        subtitle: 'Sign in with a Claude Pro/Max or ChatGPT Plus/Pro subscription. The token stays on this Mac.',
        signedIn: 'Signed in',
        notSignedIn: 'Not signed in',
        signIn: 'Sign in',
        signInAgain: 'Sign in again',
        signOut: 'Sign out',
        signInHint: 'Opens the provider’s own sign-in page in your browser.',
        signedInDetail: 'Model requests use this account automatically.',
        signOutHint: 'Removes the saved sign-in from this Mac. It does not cancel the subscription.',
        signOutConfirm: 'Remove the saved sign-in from this Mac? You can sign in again later.',
        waiting: 'Waiting for the provider…',
        openPage: 'Open the sign-in page',
        code: 'Code',
        copy: 'Copy',
        copied: 'Copied',
        question: 'The provider is asking',
        answerPlaceholder: 'Type or paste here',
        send: 'Continue',
        cancel: 'Cancel',
        failed: 'Sign-in failed',
        cancelled: 'Sign-in was cancelled.',
        savedFirst: 'Save this provider first, then sign in.',
        startFailed: 'Could not start the sign-in.',
      },
      zh: {
        title: 'Claude / ChatGPT 账号',
        subtitle: '用 Claude Pro/Max 或 ChatGPT Plus/Pro 订阅账号登录。令牌只保存在这台 Mac 上。',
        signedIn: '已登录',
        notSignedIn: '未登录',
        signIn: '登录',
        signInAgain: '重新登录',
        signOut: '退出登录',
        signInHint: '会在浏览器中打开服务商自己的登录页。',
        signedInDetail: '模型请求会自动使用这个账号。',
        signOutHint: '只会删除本机保存的登录记录，不会取消订阅。',
        signOutConfirm: '要删除本机保存的登录记录吗？之后可以重新登录。',
        waiting: '正在等待服务商…',
        openPage: '打开登录页',
        code: '验证码',
        copy: '复制',
        copied: '已复制',
        question: '服务商提问',
        answerPlaceholder: '在这里输入或粘贴',
        send: '继续',
        cancel: '取消',
        failed: '登录失败',
        cancelled: '登录已取消。',
        savedFirst: '请先保存这个服务商，然后再登录。',
        startFailed: '无法开始登录。',
      },
    }

    function createTranslate(ctx) {
      const locale = typeof ctx.get === 'function' ? ctx.get('locale') : undefined
      if (locale) {
        try {
          ctx.effect(() => locale.register('b1003', 'en', COPY.en), 'b-1003: en copy')
          ctx.effect(() => locale.register('b1003', 'zh', COPY.zh), 'b-1003: zh copy')
        } catch {
          /* the built-in copy is enough */
        }
      }
      return (key, params) => {
        let value
        try {
          if (locale) {
            const translate = locale.bind('b1003')
            if (typeof translate === 'function') value = translate(key, params)
          }
        } catch {
          value = undefined
        }
        if (typeof value !== 'string' || value.length === 0) value = COPY.en[key] ?? key
        if (params) {
          for (const [name, replacement] of Object.entries(params)) {
            value = value.split(`{${name}}`).join(String(replacement))
          }
        }
        return value
      }
    }

    const STYLES = `
      .b1003-card { display: flex; flex-direction: column; gap: 10px; margin-top: 10px; padding: 12px 14px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 10px; background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); }
      .b1003-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
      .b1003-title { font-size: 13.5px; font-weight: 600; line-height: 1.45; }
      .b1003-badge { display: inline-block; margin-right: 6px; padding: 0 5px; border-radius: 4px; background: color-mix(in srgb, var(--dsw-alias-brand-primary) 14%, transparent); color: var(--dsw-alias-brand-primary); font-size: 10.5px; font-weight: 600; line-height: 17px; vertical-align: 1px; }
      .b1003-sub { margin-top: 3px; font-size: 12px; line-height: 1.55; color: var(--dsw-alias-label-secondary); }
      .b1003-state { display: inline-flex; align-items: center; gap: 6px; flex: none; font-size: 11.5px; color: var(--dsw-alias-label-secondary); white-space: nowrap; }
      .b1003-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--dsw-alias-state-idle-primary); }
      .b1003-dot-on { background: var(--dsw-alias-state-success-primary); }
      .b1003-body { display: flex; flex-direction: column; gap: 8px; }
      .b1003-hint { font-size: 12px; line-height: 1.55; color: var(--dsw-alias-label-secondary); }
      .b1003-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
      .b1003-quiet { font-size: 11.5px; line-height: 1.5; color: var(--dsw-alias-label-secondary); }
      .b1003-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 6px 12px; border-radius: 8px; border: 1px solid var(--dsw-alias-border-l1); background: transparent; color: var(--dsw-alias-label-primary); font: inherit; font-size: 12.5px; line-height: 1.4; text-decoration: none; cursor: pointer; }
      .b1003-btn:hover:not(:disabled) { background: var(--dsw-alias-bg-layer-1); }
      .b1003-btn:disabled { opacity: 0.5; cursor: default; }
      .b1003-btn-primary { border-color: transparent; background: var(--dsw-alias-brand-primary); color: #ffffff; font-weight: 600; }
      .b1003-btn-primary:hover:not(:disabled) { background: var(--dsw-alias-brand-primary); filter: brightness(1.06); }
      .b1003-btn-small { padding: 3px 9px; font-size: 11.5px; }
      .b1003-notice { display: flex; flex-direction: column; gap: 8px; padding: 10px 12px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 9px; background: var(--dsw-alias-bg-layer-1); font-size: 12.5px; line-height: 1.55; }
      .b1003-code-row, .b1003-link-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
      .b1003-code { padding: 3px 10px; border-radius: 6px; background: color-mix(in srgb, var(--dsw-alias-brand-primary) 12%, transparent); color: var(--dsw-alias-brand-primary); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 14px; font-weight: 700; letter-spacing: 0.08em; }
      .b1003-url { min-width: 0; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 11px; color: var(--dsw-alias-label-secondary); }
      .b1003-prompt { display: flex; align-items: stretch; gap: 8px; flex-wrap: wrap; }
      .b1003-prompt-msg { flex-basis: 100%; font-size: 12.5px; line-height: 1.5; }
      .b1003-input { flex: 1; min-width: 160px; padding: 6px 9px; border-radius: 8px; border: 1px solid var(--dsw-alias-border-l1); background: var(--dsw-alias-bg-base); color: var(--dsw-alias-label-primary); font: inherit; font-size: 12.5px; }
      .b1003-input:focus { outline: 2px solid color-mix(in srgb, var(--dsw-alias-brand-primary) 55%, transparent); outline-offset: -1px; }
      .b1003-note { padding: 9px 12px; border-radius: 9px; border: 1px solid var(--dsw-alias-border-l1); background: var(--dsw-alias-bg-layer-1); font-size: 12px; line-height: 1.55; }
      .b1003-note-bad { border-color: var(--dsw-alias-state-error-primary); color: var(--dsw-alias-state-error-primary); }
      .b1003-waiting { font-size: 12px; color: var(--dsw-alias-label-secondary); }
    `

    function cleanText(value, limit) {
      return typeof value === 'string' ? value.slice(0, limit) : ''
    }

    function ConnectionCard(props) {
      const { provider, configured, t } = props
      const providerId = typeof provider?.provider === 'string' ? provider.provider : ''
      const [status, setStatus] = useState(undefined)
      const [running, setRunning] = useState(false)
      const [notice, setNotice] = useState(null)
      const [prompt, setPrompt] = useState(null)
      const [settled, setSettled] = useState(null)
      const [failure, setFailure] = useState('')
      const [error, setError] = useState('')
      const [answer, setAnswer] = useState('')
      const [copied, setCopied] = useState(false)
      const sinceRef = useRef(0)
      const copyTimer = useRef(undefined)

      const call = useCallback(async (path, body) => {
        const response = await fetch(`${API}${path}`, {
          method: body === undefined ? 'GET' : 'POST',
          headers: {
            accept: 'application/json',
            'x-dsh-b-1003': '1',
            ...(body === undefined ? {} : { 'content-type': 'application/json' }),
          },
          body: body === undefined ? undefined : JSON.stringify(body),
        })
        const text = await response.text()
        let value = {}
        try {
          value = text.length > 0 ? JSON.parse(text) : {}
        } catch {
          value = {}
        }
        if (!response.ok) throw new Error(value.error ?? `Request failed (HTTP ${response.status})`)
        return value
      }, [])

      const refresh = useCallback(async () => {
        if (providerId.length === 0) return
        try {
          const value = await call('/status')
          const entry = value?.providers?.[providerId] ?? null
          setStatus(entry)
          if (entry?.active === true) setRunning(true)
        } catch {
          setStatus(null)
        }
      }, [call, providerId])

      useEffect(() => {
        void refresh()
      }, [refresh])

      useEffect(() => {
        if (prompt === null) return
        setAnswer(prompt.kind === 'select' ? prompt.options?.[0]?.id ?? '' : '')
      }, [prompt])

      useEffect(() => {
        return () => clearTimeout(copyTimer.current)
      }, [])

      useEffect(() => {
        if (!running || providerId.length === 0) return
        let stopped = false
        let timer
        const absorb = (frames) => {
          if (!Array.isArray(frames)) return
          for (const frame of frames) {
            if (frame?.type === 'notice') setNotice(frame)
            else if (frame?.type === 'prompt') setPrompt(frame.prompt ?? null)
            else if (frame?.type === 'prompt-withdrawn') {
              setPrompt((current) => (current?.promptId === frame.promptId ? null : current))
            } else if (frame?.type === 'settled') {
              setSettled(frame.status === 'authorized' ? 'authorized' : 'cancelled')
              setPrompt(null)
              setRunning(false)
            } else if (frame?.type === 'failed') {
              setFailure(cleanText(frame.message, 2000) || t('failed'))
              setPrompt(null)
              setRunning(false)
            }
          }
        }
        const tick = async () => {
          try {
            const value = await call(`/events?provider=${encodeURIComponent(providerId)}&since=${sinceRef.current}`)
            if (stopped) return
            if (Number.isFinite(Number(value?.since))) sinceRef.current = Number(value.since)
            absorb(value?.frames)
            if (value?.signedIn === true) {
              setStatus((current) => (current ? { ...current, signedIn: true, active: false } : current))
            }
            if (value?.active === false) {
              setRunning(false)
              void refresh()
              return
            }
            timer = setTimeout(tick, 800)
          } catch (failureValue) {
            if (stopped) return
            setError(String(failureValue?.message ?? failureValue))
            timer = setTimeout(tick, 1600)
          }
        }
        void tick()
        return () => {
          stopped = true
          clearTimeout(timer)
        }
      }, [running, providerId, call, refresh])

      const start = async () => {
        setError('')
        setFailure('')
        setNotice(null)
        setPrompt(null)
        setSettled(null)
        setAnswer('')
        sinceRef.current = 0
        try {
          await call('/sign-in', { provider: providerId })
          setRunning(true)
        } catch (failureValue) {
          setError(`${t('startFailed')} ${String(failureValue?.message ?? failureValue)}`)
        }
      }

      const send = async () => {
        if (prompt === null) return
        const value = prompt.kind === 'select' ? answer : answer.trim()
        if (value.length === 0) return
        setError('')
        try {
          await call('/answer', { provider: providerId, promptId: prompt.promptId, value })
          setPrompt(null)
          setAnswer('')
        } catch (failureValue) {
          setError(String(failureValue?.message ?? failureValue))
        }
      }

      const cancel = async () => {
        setError('')
        try {
          await call('/cancel', { provider: providerId })
          setPrompt(null)
          setAnswer('')
        } catch (failureValue) {
          setError(String(failureValue?.message ?? failureValue))
        }
      }

      const signOut = async () => {
        if (!window.confirm(t('signOutConfirm'))) return
        setError('')
        try {
          await call('/sign-out', { provider: providerId })
          setStatus((current) => (current ? { ...current, signedIn: false, active: false } : current))
          setSettled(null)
          setNotice(null)
          setPrompt(null)
          setFailure('')
        } catch (failureValue) {
          setError(String(failureValue?.message ?? failureValue))
        }
      }

      const copyCode = async () => {
        if (typeof notice?.code !== 'string' || notice.code.length === 0) return
        try {
          await navigator.clipboard.writeText(notice.code)
          setCopied(true)
          clearTimeout(copyTimer.current)
          copyTimer.current = setTimeout(() => setCopied(false), 1500)
        } catch {
          /* the code stays visible, so copying is a convenience only */
        }
      }

      if (status === undefined || status === null) return null

      const title = cleanText(status.signInLabel, 200) || cleanText(provider?.displayName, 200) || providerId
      const canSignIn = configured !== false && !running
      const note = (kind, message) =>
        h('div', { className: kind === 'bad' ? 'b1003-note b1003-note-bad' : 'b1003-note', role: 'status' }, message)

      const noticeView = (value) =>
        h(
          'div',
          { className: 'b1003-notice' },
          h('div', null, cleanText(value.message, 2000) || t('waiting')),
          typeof value.code === 'string' && value.code.length > 0
            ? h(
                'div',
                { className: 'b1003-code-row' },
                h('span', { className: 'b1003-quiet' }, t('code')),
                h('span', { className: 'b1003-code' }, value.code),
                h(
                  'button',
                  { type: 'button', className: 'b1003-btn b1003-btn-small', onClick: () => void copyCode() },
                  copied ? t('copied') : t('copy'),
                ),
              )
            : null,
          typeof value.url === 'string' && value.url.length > 0
            ? h(
                'div',
                { className: 'b1003-link-row' },
                h(
                  'a',
                  {
                    className: 'b1003-btn b1003-btn-primary',
                    href: value.url,
                    target: '_blank',
                    rel: 'noreferrer noopener',
                  },
                  t('openPage'),
                ),
                h('span', { className: 'b1003-url', title: value.url }, value.url),
              )
            : null,
        )

      const promptView = (value) =>
        h(
          'div',
          { className: 'b1003-prompt' },
          h('div', { className: 'b1003-prompt-msg' }, cleanText(value.message, 2000) || t('question')),
          value.kind === 'select'
            ? h(
                'select',
                {
                  className: 'b1003-input',
                  value: answer,
                  'aria-label': cleanText(value.message, 300) || t('question'),
                  onChange: (event) => setAnswer(event.target.value),
                },
                (Array.isArray(value.options) ? value.options : []).map((option) =>
                  h('option', { key: option.id, value: option.id }, option.label),
                ),
              )
            : h('input', {
                className: 'b1003-input',
                type: value.kind === 'secret' ? 'password' : 'text',
                value: answer,
                placeholder: cleanText(value.placeholder, 300) || t('answerPlaceholder'),
                'aria-label': cleanText(value.message, 300) || t('question'),
                onChange: (event) => setAnswer(event.target.value),
                onKeyDown: (event) => {
                  if (event.key === 'Enter') void send()
                },
              }),
          h(
            'button',
            {
              type: 'button',
              className: 'b1003-btn b1003-btn-primary',
              disabled: answer.length === 0,
              onClick: () => void send(),
            },
            t('send'),
          ),
        )

      return h(
        'section',
        { className: 'b1003-card', 'aria-label': t('title') },
        h('style', null, STYLES),
        h(
          'div',
          { className: 'b1003-head' },
          h(
            'div',
            null,
            h('div', { className: 'b1003-title' }, h('span', { className: 'b1003-badge' }, PACKAGE_ID), title),
            h('div', { className: 'b1003-sub' }, t('subtitle')),
          ),
          h(
            'span',
            { className: 'b1003-state', role: 'status' },
            h('span', { className: status.signedIn ? 'b1003-dot b1003-dot-on' : 'b1003-dot' }),
            status.signedIn ? t('signedIn') : t('notSignedIn'),
          ),
        ),
        error.length > 0 ? note('bad', error) : null,
        failure.length > 0 ? note('bad', `${t('failed')}: ${failure}`) : null,
        settled === 'cancelled' ? note('', t('cancelled')) : null,
        running
          ? h(
              'div',
              { className: 'b1003-body' },
              h('div', { className: 'b1003-waiting', role: 'status', 'aria-live': 'polite' }, t('waiting')),
              notice === null ? null : noticeView(notice),
              prompt === null ? null : promptView(prompt),
              h(
                'div',
                { className: 'b1003-actions' },
                h('button', { type: 'button', className: 'b1003-btn', onClick: () => void cancel() }, t('cancel')),
              ),
            )
          : status.signedIn
            ? h(
                'div',
                { className: 'b1003-body' },
                h('div', { className: 'b1003-hint' }, t('signedInDetail')),
                h(
                  'div',
                  { className: 'b1003-actions' },
                  h(
                    'button',
                    { type: 'button', className: 'b1003-btn', onClick: () => void start() },
                    t('signInAgain'),
                  ),
                  h(
                    'button',
                    { type: 'button', className: 'b1003-btn', onClick: () => void signOut() },
                    t('signOut'),
                  ),
                  h('span', { className: 'b1003-quiet' }, t('signOutHint')),
                ),
              )
            : h(
                'div',
                { className: 'b1003-body' },
                configured === false ? h('div', { className: 'b1003-hint' }, t('savedFirst')) : null,
                h(
                  'div',
                  { className: 'b1003-actions' },
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'b1003-btn b1003-btn-primary',
                      disabled: !canSignIn,
                      onClick: () => void start(),
                    },
                    t('signIn'),
                  ),
                  h('span', { className: 'b1003-quiet' }, t('signInHint')),
                ),
              ),
      )
    }

    return {
      inject: ['slots'],
      apply(ctx) {
        const t = createTranslate(ctx)
        ctx.slots.inject('settings.models.provider-card', () =>
          ctx.slots.register(
            { name: 'settings.models.provider-card', key: PROVIDER_NS },
            (props) => h(ConnectionCard, { ...props, t }),
          ),
        )
      },
    }
  },
})
