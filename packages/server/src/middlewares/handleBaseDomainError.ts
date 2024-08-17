import type { Context, Next } from 'koa'
import { requireEnv } from '../utils/requireEnv.js'
import { serveStaticFile } from '../utils/serveStaticFile.js'

const BASE_DOMAIN = requireEnv('BASE_DOMAIN')

export async function handleBaseDomainError(ctx: Context, next: Next): Promise<void> {
  if (ctx.host !== BASE_DOMAIN) {
    await next()

    return
  }

  if (ctx.status === 404) {
    await serveStaticFile(ctx, '404.html', 404)
  }
}
