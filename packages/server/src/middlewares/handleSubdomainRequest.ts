import { B } from 'bhala'
import cuid from 'cuid'
import type { Context, Next } from 'koa'
import { ClientMessage, ServerMessage } from 'publichost-common'

import type { WebSocket } from 'ws'
import { CLIENTS_STORE, PENDING_REQUESTS_STORE } from '../stores.js'
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

  const requestId = cuid()
  const subdomain = ctx.host.split('.')[0]

  B.log(
    '[PublicHost Server]',
    `[${subdomain}]`,
    `[${requestId}]`,
    `⬅️ Receiving HTTP Request ${ctx.request.method} ${ctx.req.url}.`,
  )

  const ws = CLIENTS_STORE.get(subdomain)
  if (!ws) {
    ctx.status = 404
    ctx.body = 'Subdomain not found'

    await next()

    return
  }

  const bodyBuffer = await getRawBody(ctx.req)

  B.log(
    '[PublicHost Server]',
    `[${subdomain}]`,
    `[${requestId}]`,
    `➡️ Forwarding HTTP ${ctx.request.method} ${ctx.req.url} to PublicHost Client.`,
  )

  const requestMessage: ServerMessage.RequestMessage = {
    id: requestId,
    type: ServerMessage.Type.REQUEST,
    request: {
      method: ctx.method,
      url: ctx.url,
      headers: ctx.request.headers as Record<string, string>,
      rawBody: bodyBuffer.toString(),
    },
  }
  PENDING_REQUESTS_STORE.set(requestMessage.id, { ctx })
  ws.send(JSON.stringify(requestMessage))

  await waitForClientResponse(requestId, subdomain, ws)
}

async function waitForClientResponse(requestId: string, subdomain: string, ws: WebSocket) {
  await new Promise((resolve, reject) => {
    const pendingRequest = PENDING_REQUESTS_STORE.get(requestId)
    if (!pendingRequest) {
      return reject(new Error('Pending request not found'))
    }

    pendingRequest.resolve = resolve

    const handleMessage = (rawMessage: string) => {
      try {
        const clientMessage = JSON.parse(rawMessage) as ClientMessage.Message
        if (clientMessage.type !== ClientMessage.Type.RESPONSE || clientMessage.id !== requestId) {
          return
        }

        const clientResponseMessage = clientMessage // Clarify type inference

        const ctx = pendingRequest.ctx
        ctx.status = clientResponseMessage.response.status || 200
        ctx.set(clientResponseMessage.response.headers)
        ctx.body = clientResponseMessage.response.rawBody

        B.log(
          '[PublicHost Server]',
          `[${subdomain}]`,
          `[${requestId}]`,
          `⬅️ Sending back HTTP Response ${ctx.status} response for HTTP ${ctx.request.method} ${ctx.req.url}.`,
        )

        resolve(undefined)

        setTimeout(() => {
          PENDING_REQUESTS_STORE.delete(clientMessage.id)
        }, 1000)
      } catch (err) {
        reject(err)

        setTimeout(() => {
          PENDING_REQUESTS_STORE.delete(requestId)
        }, 1000)
      }
    }

    ws.on('message', handleMessage)

    ws.on('close', () => {
      reject(new Error('WebSocket connection closed before response was received.'))

      setTimeout(() => {
        PENDING_REQUESTS_STORE.delete(requestId)
      }, 1000)
    })

    ws.on('error', (err) => {
      reject(err)

      setTimeout(() => {
        PENDING_REQUESTS_STORE.delete(requestId)
      }, 1000)
    })
  })
}

function getRawBody(req: Context['req']): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks = []

    req.on('data', (chunk) => {
      // @ts-ignore
      chunks.push(chunk)
    })

    req.on('end', () => {
      resolve(Buffer.concat(chunks))
    })

    req.on('error', (err) => {
      reject(err)
    })
  })
}
