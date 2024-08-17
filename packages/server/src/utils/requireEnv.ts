import { B } from 'bhala'

export function requireEnv(key: string): string {
  const value = process.env[key]
  if (!value || value.trim() === '') {
    B.error('[PublicHost Server]', `\`${key}\` environment variable is undefined or empty.`)

    process.exit(1)
  }

  return value
}
