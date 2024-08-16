import axios from 'axios'
import { B } from 'bhala'
import { WEBSOCKETS_CLIENT_MESSAGE_TYPE, WEBSOCKETS_SERVER_MESSAGE_TYPE } from 'publichost-common'
import { WebSocket } from 'ws'
import { DEFAULT_START_OPTIONS } from '../constants.js'
import { config } from '../libs/Config.js'

/**
 * @param {string} publicHostServerUrl
 * @param {string} subdomain
 * @param {Partial<import('../types.ts').StartOptions>} options
 */
export function start(publicHostServerUrl, subdomain, options) {
  const controlledOptions = { ...options, ...DEFAULT_START_OPTIONS }
  const { isHttps, localhostAppPort } = controlledOptions
  const localhostAppBaseUrl = `http${isHttps ? 's' : ''}://localhost:${localhostAppPort}`
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

  ws.on(
    'message',
    /**
     * @param {string} data
     */
    async (data) => {
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
          url: `${localhostAppBaseUrl}${request.url}`,
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
        if (!err) {
          B.error('[PublicHost Client]', `[${subdomain}]`, 'Unknown error occurred.')

          return
        }

        /** @type {any} */
        const anyError = err

        B.warn(
          '[PublicHost Client]',
          `[${subdomain}]`,
          `⬅️ Forwarding Localhost App HTTP ${anyError?.response?.status ?? 500} error response to PublicHost Server.`,
        )
        ws.send(
          JSON.stringify({
            type: WEBSOCKETS_CLIENT_MESSAGE_TYPE.RESPONSE,
            response: {
              status: anyError?.response?.status ?? 500,
              headers: anyError?.response?.headers ?? {},
              body: anyError?.response?.data ?? 'Internal Server Error',
            },
          }),
        )
      }
    },
  )

  ws.on('close', () => {
    B.log('[PublicHost Client]', `[${subdomain}]`, 'Connection closed by PublicHost Server.', 'Reconnecting in 5s...')

    setTimeout(() => {
      B.log('[PublicHost Client]', `[${subdomain}]`, 'Reconnecting to PublicHost Server...')
      start(publicHostServerUrl, subdomain, options)
    }, 5000)
  })

  ws.on('error', (error) => {
    B.error('[PublicHost Client]', `[${subdomain}]`, `PublicHost Server connection error: ${error}.`)
  })
}

export function startFromConfig() {
  const workspacePath = process.cwd()
  const workspaceConfig = config.getWorkspaceConfig(workspacePath)
  if (!workspaceConfig) {
    B.error('[PublicHost Client]', `No configuration found for the current workspace: ${workspacePath}.`)
    B.info('[PublicHost Client]', 'Run `ph init` to initialize a new configuration for this workspace.')

    return
  }

  const { publicHostServerUrl, subdomain, options } = workspaceConfig

  start(publicHostServerUrl, subdomain, options)
}
