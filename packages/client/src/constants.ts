import type { Config, StartOptions } from './types.js'

export const DEFAULT_CLIENT_PORT = '3000'

export const CONFIG_FILE_NAME =
  process.env.IS_LOCAL_SERVER === 'true' || process.env.IS_TEST === 'true' ? '.publichost.dev.json' : '.publichost.json'
export const INITIAL_CONFIG: Config = {
  subdomains: {},
}

export const DEFAULT_START_OPTIONS: StartOptions = {
  isHttps: false,
  localhostAppPort: DEFAULT_CLIENT_PORT,
}

export const VERSION = '1.1.2'
