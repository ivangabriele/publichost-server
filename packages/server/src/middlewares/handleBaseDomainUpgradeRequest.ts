import type { IncomingMessage } from 'node:http'
import type internal from 'node:stream'
import { B } from 'bhala'

import { webSocketServer } from '../libs/webSocketServer.js'
import { SUBDOMAINS_STORE } from '../stores.js'

export async function handleBaseDomainUpgradeRequest(
  request: IncomingMessage,
  socket: internal.Duplex,
  head: Buffer,
): Promise<void> {
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
}
