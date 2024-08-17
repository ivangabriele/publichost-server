import { randomBytes } from 'node:crypto'
import { promises as fs } from 'node:fs'
import { getAbsolutePath } from 'esm-path'
import { $ } from 'execa'

const DEV_API_KEY = randomBytes(32).toString('hex')
const DEV_PORT = 5508
const DEV_BASE_DOMAIN = `localhost:${DEV_PORT}`
const PROJECT_ROOT_PATH = getAbsolutePath(import.meta.url, '../..')
const SERVER_ENV_PATH = getAbsolutePath(import.meta.url, '../../packages/server/.env')

const envSource = [`API_KEY=${DEV_API_KEY}`, `BASE_DOMAIN=${DEV_BASE_DOMAIN}`, `PORT=${DEV_PORT}`].join('\n')
await fs.writeFile(SERVER_ENV_PATH, envSource, 'utf8')

await $`dotenv -v IS_LOCAL_SERVER=true -- yarn start:client init ${DEV_BASE_DOMAIN} publichost ${DEV_API_KEY} -w ${PROJECT_ROOT_PATH}`
