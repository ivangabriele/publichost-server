import os from 'node:os'
import path from 'node:path'
import fs from 'fs-extra'

export class Config {
  constructor() {
    this.configPath = path.join(os.homedir(), '.publichost.json')
  }

  load() {
    if (!fs.existsSync(this.configPath)) {
      fs.writeJSONSync(this.configPath, {})
    }

    return fs.readJSONSync(this.configPath)
  }

  save(config) {
    fs.writeJSONSync(this.configPath, config, { spaces: 2 })
  }
}
