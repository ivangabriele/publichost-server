import { B } from 'bhala'
import type { Context, Next } from 'koa'
import { ClientMessage, ServerMessage } from 'publichost-common'

import { CLIENTS_STORE } from '../stores.js'
import { requireEnv } from '../utils/requireEnv.js'
import { serveStaticFile } from '../utils/serveStaticFile.js'

const BASE_DOMAIN = requireEnv('BASE_DOMAIN')

export async function handleSubdomainRequest(ctx: Context, next: Next) {
  if (ctx.host === BASE_DOMAIN) {
    await next()

    return
  }
  if (!ctx.host.endsWith(`.${BASE_DOMAIN}`)) {
    B.log('[PublicHost Server]', '🚫 Request sent to wrong domain or IP. Rejecting with a 404.')

    await serveStaticFile(ctx, '404.html', 404)

    return
  }

  const subdomain = ctx.host.split('.')[0]
  const fullUrl = `${ctx.host}${ctx.req.url}`
  B.log('[PublicHost Server]', `[${subdomain}]`, `⬅️ Incoming HTTP request: \`${ctx.request.method} ${fullUrl}\`.`)

  const ws = CLIENTS_STORE.get(subdomain)
  if (!ws) {
    ctx.status = 404
    ctx.body = 'Subdomain not found'

    await next()

    return
  }

  let body = ''
  ctx.req.on('data', (chunk) => {
    body += chunk
  })

  ctx.req.on('end', () => {
    B.log(
      '[PublicHost Server]',
      `[${subdomain}]`,
      `➡️ Forwarding HTTP ${ctx.request.method} ${ctx.req.url} to PublicHost Client.`,
    )

    ws.send(
      JSON.stringify({
        type: ServerMessage.Type.REQUEST,
        request: {
          method: ctx.method,
          headers: ctx.headers,
          url: ctx.url,
          body,
        },
      }),
    )
  })

  await new Promise((resolve, reject) => {
    ws.once('message', (data: string) => {
      try {
        const clientMessage = JSON.parse(data)
        if (clientMessage?.type !== ClientMessage.Type.RESPONSE) {
          return
        }

        const response = clientMessage.response
        ctx.status = response.status || 200
        ctx.set(response.headers || {})
        ctx.body = response.body || ''

        B.log(
          '[PublicHost Server]',
          `[${subdomain}]`,
          `⬅️ Sending back PublicHost Client ${ctx.status} response for HTTP ${ctx.request.method} ${ctx.req.url}.`,
        )

        resolve(undefined)
      } catch (err) {
        reject(err)
      }
    })
  })
}
