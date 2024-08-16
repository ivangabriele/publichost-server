export const DEFAULT_CLIENT_PORT = '3000'
export const DEFAULT_SERVER_HOST = 'localhost:5508'

export const CONFIG_FILE_NAME = '.publichost.json'
/** @type {import('./types.ts').Config} */
export const INITIAL_CONFIG = {
  subdomains: {},
}

/** @type {import('./types.ts').StartOptions} */
export const DEFAULT_START_OPTIONS = {
  isHttps: false,
  localhostAppPort: DEFAULT_CLIENT_PORT,
}

export const VERSION = '0.0.0'
