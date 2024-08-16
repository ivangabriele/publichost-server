import { createServer } from 'node:http'
import { B } from 'bhala'
import Koa from 'koa'
import Router from 'koa-router'
import { WEBSOCKETS_CLIENT_MESSAGE_TYPE, WEBSOCKETS_SERVER_MESSAGE_TYPE, WebSocketError } from 'publichost-common'
import { WebSocketServer } from 'ws'

import { registerClient } from './actions/registerClient.js'
import { CLIENTS_STORE, SUBDOMAINS_STORE } from './stores.js'

const app = new Koa()
const router = new Router()
const server = createServer(app.callback())
const wss = new WebSocketServer({ noServer: true })

const { PORT = '5508' } = process.env

wss.on('connection', (ws, request) => {
  B.debug('[PublicHost Server]', 'New PublicHost Client connection opened.')

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

server.on('upgrade', (request, socket, head) => {
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

  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request)
  })
})

router.all('(.*)', async (ctx, next) => {
  const subdomain = ctx.host.split('.')[0]
  B.debug('[PublicHost Server]', `[${subdomain}]`, `⬅️ Incoming HTTP ${ctx.host}${ctx.request.method} ${ctx.req.url}.`)

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
})

app.use(router.routes()).use(router.allowedMethods())

server.listen(PORT, () => {
  console.info('[PublicHost Server]', `Listening on port ${PORT}.`)
})
