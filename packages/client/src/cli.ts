#!/bin/env node

import { program } from 'commander'
import { init } from './commands/init.js'
import { startFromConfig } from './commands/start.js'
import { DEFAULT_CLIENT_PORT } from './constants.js'
import { config } from './libs/Config.js'

program.name('ph').description('PublicHost CLI.').version('0.0.0')

program
  .command('init')
  .description(
    [
      'Create, link and save a new subdomain for the current workspace.',
      '',
      `Workspace configurations are saved to \`${config.configPath}\`.`,
    ].join('\n'),
  )
  .argument('<host>', 'PublicHost Server host (ex: "example.org" or "publichost.example.org").')
  .argument('<subdomain>', 'Subdomain to link to the current workspace (ex: "my-app").')
  .option('-p, --port <port>', 'Your localhost application port', DEFAULT_CLIENT_PORT)
  .option('--isHttps', 'Use HTTPS instead of HTTP when connecting to your localhost application', false)
  .action(init)

program.command('start').description('Start listening for incoming requests.').action(startFromConfig)

program.parse(process.argv)