import { ClientMessageType, ServerMessageType } from './constants.js'

import { WebSocketError } from './errors/WebSocketError.js'

export {
  ClientMessageType as WEBSOCKETS_CLIENT_MESSAGE_TYPE,
  ServerMessageType as WEBSOCKETS_SERVER_MESSAGE_TYPE,
  WebSocketError,
}

import type { AnyObject } from './types.js'

export type { AnyObject }
