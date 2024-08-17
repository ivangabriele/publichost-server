import axios from 'axios'
import { B } from 'bhala'
import { ClientMessage, ServerMessage } from 'publichost-common'
import { WebSocket } from 'ws'
import { DEFAULT_START_OPTIONS } from '../constants.js'
import { configManager } from '../libs/ConfigManager.js'
import type { StartOptions } from '../types.js'

export function start(publicHostServerHost: string, subdomain: string, apiKey: string, options: Partial<StartOptions>) {
  const controlledOptions = { ...options, ...DEFAULT_START_OPTIONS }
  const { isHttps, localhostAppPort } = controlledOptions
  const localhostAppBaseUrl =
    process.env.IS_TEST === 'true'
      ? 'https://jsonplaceholder.typicode.com'
      : `http${isHttps ? 's' : ''}://localhost:${localhostAppPort}`
  const webSocketScheme = process.env.IS_LOCAL_SERVER === 'true' || process.env.IS_TEST === 'true' ? 'ws' : 'wss'
  const webSocketUrl = `${webSocketScheme}://${publicHostServerHost}/${subdomain}`

  const ws = new WebSocket(webSocketUrl, {
    headers: {
      'x-api-key': apiKey,
    },
  })

  ws.on('open', () => {
    B.log(
      '[PublicHost Client]',
      `[${subdomain}]`,
      `Connected to PublicHost Server on ${webSocketUrl}.`,
      'Registering subdomain...',
    )

    ws.send(JSON.stringify({ type: ClientMessage.Type.REGISTER, subdomain }))
  })

  ws.on('ping', () => {
    B.debug('[PublicHost Client]', '⬅️ PING')

    ws.pong(undefined, undefined, () => {
      B.debug('[PublicHost Client]', 'PONG ➡️')
    })
  })

  ws.on('message', async (data: string) => {
    try {
      const message = JSON.parse(data) as ServerMessage.Message
      switch (message.type) {
        case ServerMessage.Type.REGISTERED: {
          B.success('[PublicHost Client]', `[${subdomain}]`, 'Subdomain registered.')
          B.info(
            '[PublicHost Client]',
            `[${subdomain}]`,
            `You can now access your localhost app at https://${subdomain}.${publicHostServerHost}.`,
          )

          return
        }

        case ServerMessage.Type.ERROR: {
          B.error('[PublicHost Client]', `[${subdomain}]`, `PublicHost Server sent an error: ${message.error}.`)

          return
        }

        case ServerMessage.Type.REQUEST:
          break

        default: {
          // @ts-expect-error
          B.error('[PublicHost Client]', `[${subdomain}]`, `Invalid message type: ${message.type}.`)

          return
        }
      }

      const { request } = message

      B.log(
        '[PublicHost Client]',
        `[${subdomain}]`,
        `↔️ Forwarding HTTP ${message.request.method} ${message.request.url} from PublicHost Server to Localhost App.`,
      )

      const cleanHeaders = Object.fromEntries(
        Object.entries(request.headers).filter(([key]) => !['host'].includes(key)),
      )

      const response = await axios({
        method: request.method,
        url: `${localhostAppBaseUrl}${request.url}`,
        headers: cleanHeaders,
        data: request.body,
      })
      B.log(
        '[PublicHost Client]',
        `[${subdomain}]`,
        `⬅️ Forwarding Localhost App HTTP ${response.status} response to PublicHost Server.`,
      )

      ws.send(
        JSON.stringify({
          type: ClientMessage.Type.RESPONSE,
          response: {
            status: response.status,
            headers: response.headers,
            body: response.data,
          },
        }),
      )
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    } catch (err: any) {
      if (!err) {
        B.error('[PublicHost Client]', `[${subdomain}]`, 'Unknown error occurred.')

        return
      }

      B.warn(
        '[PublicHost Client]',
        `[${subdomain}]`,
        `⬅️ Forwarding Localhost App HTTP ${err?.response?.status ?? 500} error response to PublicHost Server.`,
      )
      B.debug(err?.response?.data ? JSON.stringify(err?.response?.data) : err)
      ws.send(
        JSON.stringify({
          type: ClientMessage.Type.RESPONSE,
          response: {
            status: err?.response?.status ?? 500,
            headers: err?.response?.headers ?? {},
            body: err?.response?.data ?? 'Internal Server Error',
          },
        }),
      )
    }
  })

  ws.on('close', () => {
    B.log('[PublicHost Client]', `[${subdomain}]`, 'Connection closed by PublicHost Server.', 'Reconnecting in 5s...')

    setTimeout(() => {
      B.log('[PublicHost Client]', `[${subdomain}]`, 'Reconnecting to PublicHost Server...')
      start(publicHostServerHost, subdomain, apiKey, options)
    }, 5000)
  })

  ws.on('error', (error) => {
    B.error('[PublicHost Client]', `[${subdomain}]`, `PublicHost Server connection error: ${error}.`)
  })
}

export function startFromConfig() {
  const workspacePath = process.cwd()
  const workspaceConfig = configManager.getWorkspaceConfig(workspacePath)
  if (!workspaceConfig) {
    B.error(
      '[PublicHost Client]',
      `No configuration found for the current workspace or any of its parents: \`${workspacePath}\`.`,
    )
    B.info('[PublicHost Client]', 'Run `ph init` to initialize a new configuration for this workspace.')

    return
  }

  const { apiKey, options, publicHostServerHost, subdomain } = workspaceConfig

  start(publicHostServerHost, subdomain, apiKey, options)
}
