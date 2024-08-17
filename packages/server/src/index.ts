import { createServer } from 'node:http'
import KoaRouter from '@koa/router'
import { B } from 'bhala'
import Koa from 'koa'
import { webSocketServer } from './libs/webSocketServer.js'
import { handleBaseDomainError } from './middlewares/handleBaseDomainError.js'
import { handleBaseDomainRequest } from './middlewares/handleBaseDomainRequest.js'
import { handleBaseDomainUpgradeRequest } from './middlewares/handleBaseDomainUpgradeRequest.js'
import { handleSubdomainRequest } from './middlewares/handleSubdomainRequest.js'
import { handleWebSocketConnection } from './middlewares/handleWebSocketConnection.js'
import { requireEnv } from './utils/requireEnv.js'

const koaApp = new Koa()
const koaRouter = new KoaRouter()
const httpServer = createServer(koaApp.callback())

const PORT = requireEnv('PORT')

webSocketServer.on('connection', handleWebSocketConnection)

httpServer.on('upgrade', handleBaseDomainUpgradeRequest)

koaRouter.all('(.*)', handleSubdomainRequest)

koaApp.use(handleBaseDomainRequest).use(koaRouter.routes()).use(koaRouter.allowedMethods()).use(handleBaseDomainError)

httpServer.listen(PORT, () => {
  B.info('[PublicHost Server]', `Listening on port ${PORT}.`)
})
