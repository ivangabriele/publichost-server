import axios, { AxiosError } from 'axios'
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
    // B.debug('[PublicHost Client]', '⬅️ PING')

    ws.pong(undefined, undefined, () => {
      // B.debug('[PublicHost Client]', 'PONG ➡️')
    })
  })

  ws.on('message', async (data: string) => {
    try {
      const serverMessage = JSON.parse(data) as ServerMessage.Message
      switch (serverMessage.type) {
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
          B.error('[PublicHost Client]', `[${subdomain}]`, `PublicHost Server sent an error: ${serverMessage.error}.`)

          return
        }

        case ServerMessage.Type.REQUEST:
          break

        default: {
          // @ts-expect-error
          B.error('[PublicHost Client]', `[${subdomain}]`, `Invalid message type: ${serverMessage.type}.`)

          return
        }
      }

      const serverRequestMessage = serverMessage // Clarify type inference

      B.log(
        '[PublicHost Client]',
        `[${subdomain}]`,
        `[${serverRequestMessage.id}]`,
        `➡️ Forwarding HTTP Request ${serverMessage.request.method} ${serverMessage.request.url} to Localhost App.`,
      )

      const cleanHeaders = Object.fromEntries(
        Object.entries(serverRequestMessage.request.headers).filter(([key]) => !['host'].includes(key)),
      )

      try {
        const localhostAppResponse = await axios({
          method: serverRequestMessage.request.method,
          url: `${localhostAppBaseUrl}${serverRequestMessage.request.url}`,
          headers: cleanHeaders,
          data: serverRequestMessage.request.rawBody,
        })
        B.log(
          '[PublicHost Client]',
          `[${subdomain}]`,
          `[${serverRequestMessage.id}]`,
          `⬅️ Forwarding HTTP Response ${localhostAppResponse.status} for ${serverMessage.request.method} ${serverMessage.request.url} to PublicHost Server.`,
        )

        const clientResponseMessage: ClientMessage.ResponseMessage = {
          id: serverRequestMessage.id,
          type: ClientMessage.Type.RESPONSE,
          response: {
            status: localhostAppResponse.status,
            headers: localhostAppResponse.headers,
            rawBody: localhostAppResponse.data,
          },
        }
        ws.send(JSON.stringify(clientResponseMessage))
      } catch (err) {
        if (!(err instanceof AxiosError && err.response)) {
          B.error('[PublicHost Client]', `[${subdomain}]`, `[${serverRequestMessage.id}]`, 'An unknown error occurred.')
          const clientResponseMessage: ClientMessage.ResponseMessage = {
            id: serverRequestMessage.id,
            type: ClientMessage.Type.RESPONSE,
            response: {
              status: 500,
              headers: {},
              rawBody: '',
            },
          }
          ws.send(JSON.stringify(clientResponseMessage))

          return
        }

        B.warn(
          '[PublicHost Client]',
          `[${subdomain}]`,
          `[${serverRequestMessage.id}]`,
          `⬅️ Forwarding HTTP Response ${err.response.status ?? 500} to PublicHost Server.`,
        )
        B.debug(
          '[PublicHost Client]',
          `[${subdomain}]`,
          `[${serverRequestMessage.id}]`,
          `Error reponse body: ${err.response.data ? JSON.stringify(err.response.data) : err}`,
        )

        const clientResponseMessage: ClientMessage.ResponseMessage = {
          id: serverRequestMessage.id,
          type: ClientMessage.Type.RESPONSE,
          response: {
            status: err.response.status,
            headers: err.response.headers ?? {},
            rawBody: err.response.data,
          },
        }
        ws.send(JSON.stringify(clientResponseMessage))
      }
    } catch (err) {
      B.error('[PublicHost Client]', `[${subdomain}]`, 'An unknown error occurred.')
      B.debug('[PublicHost Client]', `[${subdomain}]`, `Error: ${err}.`)
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
