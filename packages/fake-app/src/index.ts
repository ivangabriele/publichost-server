import http from 'node:http'
import { B } from 'bhala'

const server = http.createServer((req, res) => {
  try {
    B.log('[Fake App]', '================================================================================')
    B.log('[Fake App]', `Method: ${req.method}`)
    B.log('[Fake App]', `URL: ${req.url}`)
    B.log('[Fake App]', 'Headers:')
    for (const [key, value] of Object.entries(req.headers)) {
      B.log('[Fake App]', `  ${key}: ${value}`)
    }

    let body: Buffer = Buffer.from('')
    req.on('data', (chunk) => {
      body = Buffer.concat([body, chunk])

      // B.log('[Fake App]', `Received chunk: ${chunk}`)
    })

    req.on('end', () => {
      if (body) {
        B.log('[Fake App]', 'Body:', body)
      } else {
        B.log('[Fake App]', 'Empty body')
      }
      B.log('[Fake App]', '================================================================================')

      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ message: 'Hello from the fake app!' }))
    })

    req.on('error', (err) => {
      console.error('ERROR 1', err)
      B.error('[Fake App]', 'Error processing request:', err)

      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ message: 'Internal Server Error' }))
    })
  } catch (err) {
    console.error('ERROR 2', err)

    res.writeHead(500, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ message: 'Internal Server Error' }))
  }
})

server.listen(3000, () => {
  B.info('[Fake App]', 'Server listening on port 3000.')
})
