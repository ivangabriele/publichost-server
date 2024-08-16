import type { Config, StartOptions } from './types.js'

export const DEFAULT_CLIENT_PORT = '3000'
export const DEFAULT_SERVER_HOST = 'localhost:5508'

export const CONFIG_FILE_NAME = '.publichost.json'
export const INITIAL_CONFIG: Config = {
  subdomains: {},
}

export const DEFAULT_START_OPTIONS: StartOptions = {
  isHttps: false,
  localhostAppPort: DEFAULT_CLIENT_PORT,
}

export const VERSION = '0.0.0'
