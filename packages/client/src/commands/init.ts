import { B } from 'bhala'
import { DEFAULT_START_OPTIONS } from '../constants.js'
import { configManager } from '../libs/ConfigManager.js'
import type { InitOptions } from '../types.js'

export function init(
  publicHostServerHost: string,
  subdomain: string,
  apiKey: string,
  { isHttps, port: localhostAppPort, workspacePath }: InitOptions,
) {
  const controlledStartOptions = {
    ...{
      isHttps,
      localhostAppPort,
    },
    ...DEFAULT_START_OPTIONS,
  }

  configManager.setWorkspaceConfig({
    apiKey,
    options: controlledStartOptions,
    publicHostServerHost,
    subdomain,
    workspacePath,
  })

  B.success('[PublicHost Client]', `[${subdomain}]`, `Subdomain linked to workspace ${workspacePath}.`)
}
