import { homedir } from 'node:os'
import { join } from 'node:path'
import { existsSync, readJSONSync, writeJSONSync } from 'fs-extra'
import { CONFIG_FILE_NAME, INITIAL_CONFIG } from '../constants.js'
import type { WorkspaceConfig } from '../types.js'

class Config {
  configPath: string

  constructor() {
    this.configPath = join(homedir(), CONFIG_FILE_NAME)
  }

  getWorkspaceConfig(workspacePath: string): WorkspaceConfig | undefined {
    const config = this.#load()
    const configEntry = Object.entries(config.subdomains).find(
      ([, workspaceConfig]) => workspaceConfig.workspacePath === workspacePath,
    )
    if (!configEntry) {
      return undefined
    }

    return configEntry[1]
  }

  /**
   * @param {import('../types.ts').WorkspaceConfig} newOrNextWorkspaceConfig
   */
  setWorkspaceConfig(newOrNextWorkspaceConfig) {
    const config = { ...this.#load() }
    config.subdomains[newOrNextWorkspaceConfig.subdomain] = newOrNextWorkspaceConfig

    this.#save(config)
  }

  #load(): import('../types.ts').Config {
    if (!existsSync(this.configPath)) {
      writeJSONSync(this.configPath, INITIAL_CONFIG, { spaces: 2 })
    }

    return readJSONSync(this.configPath)
  }

  #save(nextConfig: import('../types.ts').Config) {
    writeJSONSync(this.configPath, nextConfig, { spaces: 2 })
  }
}

export const config = new Config()
