/**
 * WebSockets message types sent by the client.
 */
export const WEBSOCKETS_CLIENT_MESSAGE_TYPE = {
  ERROR: 'ERROR',
  REGISTER: 'REGISTER',
  RESPONSE: 'RESPONSE',
}

/**
 * WebSockets message types sent by the server.
 */
export const WEBSOCKETS_SERVER_MESSAGE_TYPE = {
  ERROR: 'ERROR',
  REGISTERED: 'REGISTERED',
  REQUEST: 'REQUEST',
}
