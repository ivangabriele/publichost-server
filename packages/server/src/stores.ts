import type { Context } from 'koa'
import type { WebSocket } from 'ws'

export const CLIENTS_STORE = new Map<string, WebSocket>()
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const PENDING_REQUESTS_STORE = new Map<string, { ctx: Context; resolve?: (value: any) => void }>()
export const SUBDOMAINS_STORE = new Set<string>()
