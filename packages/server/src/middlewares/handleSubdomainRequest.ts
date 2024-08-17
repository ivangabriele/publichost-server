import { B } from 'bhala'
import type { Context, Next } from 'koa'
import { WEBSOCKETS_CLIENT_MESSAGE_TYPE, WEBSOCKETS_SERVER_MESSAGE_TYPE } from 'publichost-common'

import { CLIENTS_STORE } from '../stores.js'
import { requireEnv } from '../utils/requireEnv.js'
import { serveStaticFile } from '../utils/serveStaticFile.js'

const BASE_DOMAIN = requireEnv('BASE_DOMAIN')

export async function handleSubdomainRequest(ctx: Context, next: Next) {
  if (ctx.host === BASE_DOMAIN) {
    await next()
  }

  const subdomain = ctx.host.split('.')[0]
  const fullUrl = `${ctx.host}${ctx.req.url}`
  B.log('[PublicHost Server]', `[${subdomain}]`, `⬅️ Incoming HTTP request: \`${ctx.request.method} ${fullUrl}\`.`)

  if (!ctx.host.endsWith(`.${BASE_DOMAIN}`)) {
    B.log('[PublicHost Server]', `[${subdomain}]`, '🚫 Invalid domain name. Sending 404.')

    await serveStaticFile(ctx, '404.html', 400)

    return
  }

  const ws = CLIENTS_STORE.get(subdomain)
  if (!ws) {
    ctx.status = 404
    ctx.body = 'Subdomain not found'

    await next()

    return
  }

  B.log(
    '[PublicHost Server]',
    `[${subdomain}]`,
    `➡️ Forwarding HTTP ${ctx.request.method} ${ctx.req.url} to PublicHost Client.`,
  )
  ws.send(
    JSON.stringify({
      type: WEBSOCKETS_SERVER_MESSAGE_TYPE.REQUEST,
      request: {
        method: ctx.method,
        headers: ctx.headers,
        url: ctx.url,
        body: ctx.request.body,
      },
    }),
  )

  await new Promise((resolve, reject) => {
    ws.once('message', (data: string) => {
      try {
        const clientMessage = JSON.parse(data)
        if (clientMessage?.type !== WEBSOCKETS_CLIENT_MESSAGE_TYPE.RESPONSE) {
          return
        }

        B.log(
          '[PublicHost Server]',
          `[${subdomain}]`,
          `⬅️ Received PublicHost Client response for HTTP ${ctx.request.method} ${ctx.req.url}. Sending back.`,
        )

        const response = clientMessage.response
        ctx.status = response.status || 200
        ctx.set(response.headers || {})
        ctx.body = response.body || ''

        resolve(undefined)
      } catch (err) {
        reject(err)
      }
    })
  })
}
