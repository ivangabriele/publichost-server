export class WebSocketError extends Error {
  constructor(message = 'An error occurred.') {
    super(message)

    this.name = 'WebSocketError'
  }

  toWebsocketMessage() {
    return JSON.stringify({
      type: 'error',
      message: this.message,
    })
  }
}
