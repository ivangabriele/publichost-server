import { DEFAULT_START_OPTIONS } from '../constants.js'
import { config } from '../libs/Config.js'

/**
 * @param {string} publicHostServerUrl
 * @param {string} subdomain
 * @param {Partial<import('../types.ts').StartOptions>} options
 */
export function init(publicHostServerUrl, subdomain, options) {
  const controlledOptions = { ...options, ...DEFAULT_START_OPTIONS }
  const workspacePath = process.cwd()

  config.setWorkspaceConfig({
    options: controlledOptions,
    publicHostServerUrl,
    subdomain,
    workspacePath,
  })
}
