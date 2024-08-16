import { createServer } from 'node:http'
import KoaRouter from '@koa/router'
import { B } from 'bhala'
import Koa from 'koa'
import { WEBSOCKETS_CLIENT_MESSAGE_TYPE, WEBSOCKETS_SERVER_MESSAGE_TYPE, WebSocketError } from 'publichost-common'
import { WebSocketServer } from 'ws'

import { registerClient } from './actions/registerClient.js'
import { CLIENTS_STORE, SUBDOMAINS_STORE } from './stores.js'

const koaApp = new Koa()
const koaRouter = new KoaRouter()
const httpServer = createServer(koaApp.callback())
const webSocketServer = new WebSocketServer({ noServer: true })

const { API_KEY, PORT } = process.env
if (!API_KEY) {
  B.error('[PublicHost Server]', '`API_KEY` env var is undefined.')
  process.exit(1)
}
if (!PORT) {
  B.error('[PublicHost Server]', '`PORT` env var is undefined.')
  process.exit(1)
}

webSocketServer.on('connection', (ws, request) => {
  B.debug('[PublicHost Server]', 'New PublicHost Client connection opened.')

  if (request.headers['X-API-KEY'] !== API_KEY) {
    B.error('[PublicHost Server]', 'Invalid API key. Closing connection.')

    ws.close(4001, 'Invalid API key')

    return
  }

  B.debug('[PublicHost Server]', 'New PublicHost Client authorized.')

  ws.on('message', (rawMessage: string) => {
    const message = JSON.parse(rawMessage)

    try {
      switch (message.type) {
        case WEBSOCKETS_CLIENT_MESSAGE_TYPE.REGISTER:
          registerClient(ws, request, message)
          break

        case WEBSOCKETS_CLIENT_MESSAGE_TYPE.RESPONSE:
          break

        default:
          throw new WebSocketError(`Invalid message type: \`${message.type}\`.`)
      }
    } catch (err) {
      if (err instanceof WebSocketError) {
        B.warn('[PublicHost Server]', `Sending error to PublicHost Client: ${err.message}.`)

        ws.send(err.toWebsocketMessage())
      } else {
        B.error('[PublicHost Server]', `Sending unexpected error to PublicHost Client: ${err}.`)
        B.debug(err)

        ws.send(new WebSocketError().toWebsocketMessage())
      }
    }
  })
})

httpServer.on('upgrade', (request, socket, head) => {
  if (!request.url) {
    B.error('[PublicHost Server]', '`request.url` is undefined.')
    socket.destroy()

    return
  }

  const subdomain = request.url.slice(1).split('/')[0]

  B.log('[PublicHost Server]', `[${subdomain}]`, 'PublicHost Client upgrade request.')

  if (SUBDOMAINS_STORE.has(subdomain)) {
    B.log('[PublicHost Server]', `[${subdomain}]`, 'Found in Subdomain Store.')
  } else {
    B.log('[PublicHost Server]', `[${subdomain}]`, 'Not found in Subdomain Store. Adding to Subdomain Store.')
    SUBDOMAINS_STORE.add(subdomain)
    B.log('[PublicHost Server]', `[${subdomain}]`, 'Added to Subdomain Store.')
  }

  webSocketServer.handleUpgrade(request, socket, head, (ws) => {
    webSocketServer.emit('connection', ws, request)
  })
})

koaRouter.all('(.*)', async (ctx, next) => {
  const fullUrl = `${ctx.protocol}://${ctx.host}${ctx.req.url}`
  const subdomain = ctx.host.split('.')[0]

  B.debug('[PublicHost Server]', `[${subdomain}]`, `⬅️ Incoming HTTP ${ctx.request.method} ${fullUrl}.`)

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
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        body: (ctx.request as any).body,
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
})

koaApp.use(koaRouter.routes()).use(koaRouter.allowedMethods())

httpServer.listen(PORT, () => {
  console.info('[PublicHost Server]', `Listening on port ${PORT}.`)
})
