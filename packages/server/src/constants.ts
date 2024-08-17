import { getAbsolutePath } from 'esm-path'

export const PUBLIC_PATH = getAbsolutePath(import.meta.url, '../public')
