/**
 * The account lookup, without the network and without a credential store.
 *
 * Every case here builds the grant payload by hand, so the suite answers the
 * same way on a machine with no sign-ins and no internet. The live path (a real
 * token, a real profile endpoint) is exercised by the card itself; what these
 * tests pin is the contract `index.js` and `client.js` depend on: which claim
 * names the account, which status means what, and that no token ever comes back
 * in the answer.
 *
 *   node --test packages/b-1003-ai-connection/test/account.test.mjs
 */

import assert from 'node:assert/strict'
import { test } from 'node:test'

import { jwtClaims, planName, readAccount } from '../lib/account.js'

const claim = (value) => Buffer.from(JSON.stringify(value)).toString('base64url')

function jwt(claims) {
  return `header.${claim(claims)}.signature`
}

function openaiGrant(claims) {
  return {
    type: 'oauth',
    access: jwt(claims),
    refresh: 'rt.1.secret',
    expires: 1_800_000_000_000,
  }
}

function profileFetch(status, body) {
  return async () => ({ status, text: async () => (typeof body === 'string' ? body : JSON.stringify(body)) })
}

const OPENAI_CLAIMS = {
  exp: 1_777_000_000,
  'https://api.openai.com/auth': { chatgpt_plan_type: 'plus', chatgpt_account_id: 'acct-1' },
  'https://api.openai.com/profile': { email: 'bing@example.com', name: 'Bing Dai' },
}

test('a ChatGPT grant is named from its own claims, with no request', async () => {
  const account = await readAccount('openai-codex', openaiGrant(OPENAI_CLAIMS))
  assert.equal(account.email, 'bing@example.com')
  assert.equal(account.name, 'Bing Dai')
  assert.equal(account.planId, 'plus')
  assert.equal(account.plan, 'ChatGPT Plus')
  assert.equal(account.expiresAt, 1_777_000_000_000)
  assert.equal(account.error, undefined)
})

test('a token that names nothing is unreadable rather than empty', async () => {
  const account = await readAccount('openai-codex', openaiGrant({ sub: 'someone' }))
  assert.deepEqual(account, { error: { code: 'unreadable' } })
})

test('a token with no access string is unreadable', async () => {
  assert.deepEqual(await readAccount('anthropic', { type: 'oauth' }), { error: { code: 'unreadable' } })
})

test('an opaque token is not mistaken for a JWT', () => {
  assert.equal(jwtClaims('sk-ant-oat01-abcdef'), undefined)
  assert.equal(jwtClaims('one.two'), undefined)
})

test('a Claude grant is named through the profile endpoint', async () => {
  const account = await readAccount(
    'anthropic',
    { type: 'oauth', access: 'sk-ant-oat01-token', expires: 1_800_000_000_000 },
    {
      fetch: profileFetch(200, {
        account: { uuid: 'u1', email: 'bing@example.com', full_name: 'Bing' },
        organization: { organization_type: 'claude_max' },
      }),
    },
  )
  assert.equal(account.email, 'bing@example.com')
  assert.equal(account.name, 'Bing')
  assert.equal(account.plan, 'Claude Max')
  assert.equal(account.expiresAt, 1_800_000_000_000)
})

test('the profile flags decide the plan when the organization is absent', async () => {
  const account = await readAccount('anthropic', { access: 'sk-ant-oat01-token' }, {
    fetch: profileFetch(200, { account: { email: 'b@example.com', has_claude_pro: true } }),
  })
  assert.equal(account.plan, 'Claude Pro')
})

test('each refusal keeps its own code', async () => {
  const grant = { access: 'sk-ant-oat01-token' }
  assert.deepEqual(await readAccount('anthropic', grant, { fetch: profileFetch(401, {}) }), { error: { code: 'rejected' } })
  assert.deepEqual(await readAccount('anthropic', grant, { fetch: profileFetch(403, {}) }), { error: { code: 'forbidden' } })
  assert.deepEqual(await readAccount('anthropic', grant, { fetch: profileFetch(503, {}) }), { error: { code: 'http', status: 503 } })
  assert.deepEqual(await readAccount('anthropic', grant, { fetch: profileFetch(200, 'not json') }), { error: { code: 'unreadable' } })
  assert.deepEqual(
    await readAccount('anthropic', grant, {
      fetch: async () => {
        throw new Error('offline')
      },
    }),
    { error: { code: 'offline' } },
  )
})

test('a foreign opaque token is answered locally, never sent to Anthropic', async () => {
  let called = false
  const account = await readAccount('some-other-provider', { access: 'opaque-token' }, {
    fetch: async () => {
      called = true
      return { status: 200, text: async () => '{}' }
    },
  })
  assert.deepEqual(account, { error: { code: 'unreadable' } })
  assert.equal(called, false)
})

test('an unknown plan still reads as a name', () => {
  assert.equal(planName('anthropic', 'claude_max'), 'Claude Max')
  assert.equal(planName('anthropic', 'claude_something_new'), 'Something New')
  assert.equal(planName('openai-codex', ''), '')
})

test('the token never appears in an answer', async () => {
  const grant = openaiGrant(OPENAI_CLAIMS)
  const answers = [
    await readAccount('openai-codex', grant),
    await readAccount('anthropic', { access: 'sk-ant-oat01-token' }, {
      fetch: profileFetch(200, { account: { email: 'a@b.c' }, organization: {} }),
    }),
    await readAccount('anthropic', { access: 'sk-ant-oat01-token' }, { fetch: profileFetch(401, {}) }),
  ]
  const blob = JSON.stringify(answers)
  assert.equal(blob.includes(grant.access), false)
  assert.equal(blob.includes('sk-ant-oat01-token'), false)
})
