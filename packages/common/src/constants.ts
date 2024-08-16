/**
 * WebSockets message types sent by the client.
 */
export enum ClientMessageType {
  ERROR = 'ERROR',
  REGISTER = 'REGISTER',
  RESPONSE = 'RESPONSE',
}

/**
 * WebSockets message types sent by the server.
 */
export enum ServerMessageType {
  ERROR = 'ERROR',
  REGISTERED = 'REGISTERED',
  REQUEST = 'REQUEST',
}
