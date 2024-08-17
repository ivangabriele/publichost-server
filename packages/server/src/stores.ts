import type { WebSocket } from 'ws'

export const CLIENTS_STORE = new Map<string, WebSocket>()
export const SUBDOMAINS_STORE = new Set<string>()
