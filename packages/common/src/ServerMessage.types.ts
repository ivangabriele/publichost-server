/**
 * WebSockets message types sent by PublicHost Server.
 */
export namespace ServerMessage {
  export enum Type {
    ERROR = 'ERROR',
    REGISTERED = 'REGISTERED',
    REQUEST = 'REQUEST',
  }

  export type Message = ErrorMessage | RegisteredMessage | RequestMessage

  interface BaseMessage {
    type: Type
  }

  export interface ErrorMessage extends BaseMessage {
    type: Type.ERROR
    error: string
  }

  export interface RegisteredMessage extends BaseMessage {
    type: Type.REGISTERED
    subdomain: string
  }

  export interface RequestMessage extends BaseMessage {
    id: string
    type: Type.REQUEST
    request: {
      method: string
      rawBody: string
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      headers: Record<string, any>
      url: string
    }
  }
}
