import { promises as fs } from 'node:fs'
import { extname, join } from 'node:path'
import { B } from 'bhala'
import type { Context } from 'koa'
import { PUBLIC_PATH } from '../constants.js'

export async function serveStaticFile(ctx: Context, publicPath: string): Promise<void> {
  try {
    const filePath = join(PUBLIC_PATH, publicPath)

    const content = await fs.readFile(filePath, 'utf-8')

    ctx.status = 404
    ctx.type = extname(filePath)
    ctx.body = content
  } catch (err) {
    B.error('[PublicHost Server]', '[INTERNAL]', `Error while serving static file \`${publicPath}\`.`)

    ctx.status = 500
    ctx.body = 'Internal Server Error'
  }
}
