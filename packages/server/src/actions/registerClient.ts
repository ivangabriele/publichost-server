import type { IncomingMessage } from 'node:http'
import { B } from 'bhala'
import { type AnyObject, WEBSOCKETS_SERVER_MESSAGE_TYPE, WebSocketError } from 'publichost-common'
import type { WebSocket } from 'ws'

import { CLIENTS_STORE, SUBDOMAINS_STORE } from '../stores.js'

export function registerClient(ws: WebSocket, _request: IncomingMessage, message: AnyObject) {
  const { subdomain } = message
  if (!subdomain || typeof subdomain !== 'string') {
    throw new WebSocketError(`Invalid subdomain: \`${subdomain}\`.`)
  }
  if (!SUBDOMAINS_STORE.has(subdomain)) {
    throw new WebSocketError(`Subdomain "${subdomain}" not found.`)
  }

  CLIENTS_STORE.set(subdomain, ws)
  B.success('[PublicHost Server]', `[${subdomain}]`, 'PublicHost Client connection registered.')

  ws.on('close', () => {
    B.warn('[PublicHost Server]', `[${subdomain}]`, 'PublicHost Client connection closed.')

    B.debug('[PublicHost Server]', `[${subdomain}]`, 'Clearing ping interval.')
    clearInterval(timeout)

    B.debug('[PublicHost Server]', `[${subdomain}]`, 'Removing PublicHost Client connection.')
    CLIENTS_STORE.delete(subdomain)
  })

  ws.on('pong', () => {
    B.debug('[PublicHost Server]', `[${subdomain}]`, '⬅️ PONG')
  })

  const timeout = setInterval(() => {
    if (ws.readyState === ws.OPEN) {
      B.debug('[PublicHost Server]', `[${subdomain}]`, 'PING ➡️')

      ws.ping()
    }
  }, 30000)

  ws.send(JSON.stringify({ type: WEBSOCKETS_SERVER_MESSAGE_TYPE.REGISTERED, subdomain }))
}
