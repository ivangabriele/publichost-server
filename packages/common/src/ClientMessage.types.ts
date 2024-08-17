/**
 * WebSockets message types sent by PublicHost Client.
 */
export namespace ClientMessage {
  export enum Type {
    ERROR = 'ERROR',
    REGISTER = 'REGISTER',
    RESPONSE = 'RESPONSE',
  }

  export type Message = ErrorMessage | RegisterMessage | ResponseMessage

  interface BaseMessage {
    type: Type
  }

  export interface ErrorMessage extends BaseMessage {
    type: Type.ERROR
    error: string
  }

  export interface RegisterMessage extends BaseMessage {
    type: Type.REGISTER
    subdomain: string
  }

  export interface ResponseMessage extends BaseMessage {
    id: string
    type: Type.RESPONSE
    response: {
      status: number
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      headers: Record<string, any>
      rawBody: string
    }
  }
}
