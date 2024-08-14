import assert from 'node:assert/strict'
import http from 'node:http'
import net from 'node:net'
import { Duplex } from 'node:stream'

import { Client } from './Client.js'

class DummySocket extends Duplex {
  // biome-ignore lint/complexity/noUselessConstructor: <explanation>
  constructor(options) {
    super(options)
  }

  _write(_chunk, _encoding, callback) {
    callback()
  }

  _read(_size) {
    this.push('HTTP/1.1 304 Not Modified\r\nX-Powered-By: dummy\r\n\r\n\r\n')
    this.push(null)
  }
}

class DummyWebsocket extends Duplex {
  constructor(options) {
    super(options)
    this.sentHeader = false
  }

  _write(chunk, _encoding, callback) {
    const str = chunk.toString()
    // if chunk contains `GET / HTTP/1.1` -> queue headers
    // otherwise echo back received data
    if (str.indexOf('GET / HTTP/1.1') === 0) {
      const arr = ['HTTP/1.1 101 Switching Protocols', 'Upgrade: websocket', 'Connection: Upgrade']
      this.push(arr.join('\r\n'))
      this.push('\r\n\r\n')
    } else {
      this.push(str)
    }
    callback()
  }

  _read(_size) {
    // nothing to implement
  }
}

class DummyAgent extends http.Agent {
  // biome-ignore lint/complexity/noUselessConstructor: <explanation>
  constructor() {
    super()
  }

  createConnection(_options, cb) {
    cb(null, new DummySocket())
  }
}

// biome-ignore lint/correctness/noUndeclaredVariables: <explanation>
describe('Client', () => {
  // biome-ignore lint/correctness/noUndeclaredVariables: <explanation>
  it('should handle request', async () => {
    const agent = new DummyAgent()
    const client = new Client({ agent })

    const server = http.createServer((req, res) => {
      client.handleRequest(req, res)
    })

    await new Promise((resolve) => server.listen(resolve))

    const address = server.address()
    const opt = {
      host: 'localhost',
      port: address.port,
      path: '/',
    }

    const res = await new Promise((resolve) => {
      const req = http.get(opt, (res) => {
        resolve(res)
      })
      req.end()
    })
    assert.equal(res.headers['x-powered-by'], 'dummy')
    server.close()
  })

  // biome-ignore lint/correctness/noUndeclaredVariables: <explanation>
  it('should handle upgrade', async () => {
    // need a websocket server and a socket for it
    class DummyWebsocketAgent extends http.Agent {
      // biome-ignore lint/complexity/noUselessConstructor: <explanation>
      constructor() {
        super()
      }

      createConnection(_options, cb) {
        cb(null, new DummyWebsocket())
      }
    }

    const agent = new DummyWebsocketAgent()
    const client = new Client({ agent })

    const server = http.createServer()
    server.on('upgrade', (req, socket, _head) => {
      client.handleUpgrade(req, socket)
    })

    await new Promise((resolve) => server.listen(resolve))

    const address = server.address()

    const netClient = await new Promise((resolve) => {
      const newClient = net.createConnection({ port: address.port }, () => {
        resolve(newClient)
      })
    })

    const out = ['GET / HTTP/1.1', 'Connection: Upgrade', 'Upgrade: websocket']

    netClient.write(`${out.join('\r\n')}\r\n\r\n`)

    {
      const data = await new Promise((resolve) => {
        netClient.once('data', (chunk) => {
          resolve(chunk.toString())
        })
      })
      const exp = ['HTTP/1.1 101 Switching Protocols', 'Upgrade: websocket', 'Connection: Upgrade']

      assert.equal(`${exp.join('\r\n')}\r\n\r\n`, data)
    }

    {
      netClient.write('foobar')
      const data = await new Promise((resolve) => {
        netClient.once('data', (chunk) => {
          resolve(chunk.toString())
        })
      })
      assert.equal('foobar', data)
    }

    netClient.destroy()
    server.close()
  })
})
