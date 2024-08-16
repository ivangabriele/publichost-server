import { homedir } from 'node:os'
import { join } from 'node:path'
import fs from 'fs-extra'
import { CONFIG_FILE_NAME, INITIAL_CONFIG } from '../constants.js'

class Config {
  constructor() {
    this.configPath = join(homedir(), CONFIG_FILE_NAME)
  }

  /**
   * @param {string} workspacePath
   * @returns {import('../types.ts').WorkspaceConfig | undefined}
   */
  getWorkspaceConfig(workspacePath) {
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

  /**
   * @returns {import('../types.ts').Config}
   */
  #load() {
    if (!fs.existsSync(this.configPath)) {
      fs.writeJSONSync(this.configPath, INITIAL_CONFIG, { spaces: 2 })
    }

    return fs.readJSONSync(this.configPath)
  }

  /**
   * @param {import('../types.ts').Config} nextConfig
   */
  #save(nextConfig) {
    fs.writeJSONSync(this.configPath, nextConfig, { spaces: 2 })
  }
}

export const config = new Config()
