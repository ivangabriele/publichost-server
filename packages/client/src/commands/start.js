import axios from 'axios'
import { B } from 'bhala'
import { WEBSOCKETS_CLIENT_MESSAGE_TYPE, WEBSOCKETS_SERVER_MESSAGE_TYPE } from 'publichost-common'
import { WebSocket } from 'ws'

export function start(publicHostServerUrl, subdomain, localhostAppPort, options = {}) {
  const { isHttps = false } = options
  const ws = new WebSocket(`${publicHostServerUrl}/${subdomain}`)

  ws.on('open', () => {
    B.log(
      '[PublicHost Client]',
      `[${subdomain}]`,
      `Connected to PublicHost Server on "${publicHostServerUrl}".`,
      'Registering subdomain...',
    )
    ws.send(JSON.stringify({ type: WEBSOCKETS_CLIENT_MESSAGE_TYPE.REGISTER, subdomain }))
  })

  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data)
      switch (message.type) {
        case WEBSOCKETS_SERVER_MESSAGE_TYPE.REGISTERED: {
          B.success('[PublicHost Client]', `[${subdomain}]`, 'Subdomain registered.')

          return
        }

        case WEBSOCKETS_SERVER_MESSAGE_TYPE.ERROR: {
          B.error('[PublicHost Client]', `[${subdomain}]`, `PublicHost Server sent an error: ${message.error}.`)

          return
        }

        case WEBSOCKETS_SERVER_MESSAGE_TYPE.REQUEST:
          break

        default: {
          B.error('[PublicHost Client]', `[${subdomain}]`, `Invalid message type: ${message.type}.`)

          return
        }
      }

      const { request } = message
      B.log(
        '[PublicHost Client]',
        `[${subdomain}]`,
        `↔️ Forwarding HTTP ${request.method} ${request.url} from PublicHost Server to Localhost App.`,
      )
      const response = await axios({
        method: request.method,
        url: `http${isHttps ? 's' : ''}://localhost:${localhostAppPort}${request.url}`,
        headers: request.headers,
        data: request.body,
      })

      B.log(
        '[PublicHost Client]',
        `[${subdomain}]`,
        `⬅️ Forwarding Localhost App HTTP ${response.status} response to PublicHost Server.`,
      )
      ws.send(
        JSON.stringify({
          type: WEBSOCKETS_CLIENT_MESSAGE_TYPE.RESPONSE,
          response: {
            status: response.status,
            headers: response.headers,
            body: response.data,
          },
        }),
      )
    } catch (err) {
      B.warn(
        '[PublicHost Client]',
        `[${subdomain}]`,
        `⬅️ Forwarding Localhost App HTTP ${err?.response?.status ?? 500} error response to PublicHost Server.`,
      )
      ws.send(
        JSON.stringify({
          type: WEBSOCKETS_CLIENT_MESSAGE_TYPE.RESPONSE,
          response: {
            status: err.response ? err.response.status : 500,
            headers: err.response ? err.response.headers : {},
            body: err.response ? err.response.data : 'Internal Server Error',
          },
        }),
      )
    }
  })

  ws.on('close', () => {
    B.log('[PublicHost Client]', `[${subdomain}]`, 'Connection closed by PublicHost Server.', 'Reconnecting in 5s...')

    setTimeout(() => {
      B.log('[PublicHost Client]', `[${subdomain}]`, 'Reconnecting to PublicHost Server...')
      start(publicHostServerUrl, subdomain, localhostAppPort, options)
    }, 5000)
  })

  ws.on('error', (error) => {
    B.error('[PublicHost Client]', `[${subdomain}]`, `PublicHost Server connection error: ${error}.`)
  })
}
