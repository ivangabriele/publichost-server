import { homedir } from 'node:os'
import { join } from 'node:path'
import { pathExistsSync, readJSONSync, writeJSONSync } from 'fs-extra/esm'
import { CONFIG_FILE_NAME, INITIAL_CONFIG } from '../constants.js'
import type { Config, WorkspaceConfig } from '../types.js'

class ConfigManager {
  configPath: string

  constructor() {
    this.configPath = join(homedir(), CONFIG_FILE_NAME)
  }

  getWorkspaceConfig(workspacePath: string): WorkspaceConfig | undefined {
    const config = this.#load()
    const configEntry = Object.entries(config.subdomains).find(
      ([, workspaceConfig]) => workspaceConfig.workspacePath === workspacePath,
    )
    if (configEntry) {
      return configEntry[1]
    }
    if (workspacePath.includes('/')) {
      const parentDirectory = workspacePath.split('/').slice(0, -1).join('/')

      return this.getWorkspaceConfig(parentDirectory)
    }

    return undefined
  }

  setWorkspaceConfig(newOrNextWorkspaceConfig: WorkspaceConfig) {
    const config = { ...this.#load() }
    config.subdomains[newOrNextWorkspaceConfig.subdomain] = newOrNextWorkspaceConfig

    this.#save(config)
  }

  #load(): Config {
    if (!pathExistsSync(this.configPath)) {
      writeJSONSync(this.configPath, INITIAL_CONFIG, { spaces: 2 })
    }

    return readJSONSync(this.configPath)
  }

  #save(nextConfig: Config) {
    writeJSONSync(this.configPath, nextConfig, { spaces: 2 })
  }
}

export const configManager = new ConfigManager()
