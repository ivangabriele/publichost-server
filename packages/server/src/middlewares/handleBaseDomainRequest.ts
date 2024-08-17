import type { Context, Next } from 'koa'
import koaStaticServe from 'koa-static'

import { B } from 'bhala'
import { PUBLIC_PATH } from '../constants.js'
import { requireEnv } from '../utils/requireEnv.js'

const BASE_DOMAIN = requireEnv('BASE_DOMAIN')

export async function handleBaseDomainRequest(ctx: Context, next: Next): Promise<void> {
  if (ctx.host !== BASE_DOMAIN) {
    await next()

    return
  }

  B.debug('[PublicHost Server]', 'Serving base domain request.')

  await koaStaticServe(PUBLIC_PATH)(ctx, next)
}
