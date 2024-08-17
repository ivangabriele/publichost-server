import type { IncomingMessage } from 'node:http'
import { B } from 'bhala'
import { ClientMessage, WebSocketError } from 'publichost-common'

import type { WebSocket } from 'ws'
import { registerClient } from '../actions/registerClient.js'
import { requireEnv } from '../utils/requireEnv.js'

const API_KEY = requireEnv('API_KEY')

export async function handleWebSocketConnection(ws: WebSocket, request: IncomingMessage) {
  B.debug('[PublicHost Server]', 'New PublicHost Client connection opened.')

  if (!request.url) {
    B.error('[PublicHost Server]', '`request.url` is undefined.')
    ws.close(4000, 'Invalid request URL')

    return
  }

  if (request.headers['x-api-key'] !== API_KEY) {
    B.error('[PublicHost Server]', 'Invalid API key. Closing connection.')

    ws.close(4001, 'Invalid API key')

    return
  }

  B.debug('[PublicHost Server]', 'New PublicHost Client authorized.')

  ws.on('message', (rawMessage: string) => {
    const message = JSON.parse(rawMessage) as ClientMessage.Message

    try {
      switch (message.type) {
        case ClientMessage.Type.REGISTER:
          registerClient(ws, request, message)
          break

        case ClientMessage.Type.RESPONSE:
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
}
