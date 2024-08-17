export type StartOptions = {
  isHttps: boolean
  localhostAppPort: string
}

export type InitOptions = {
  isHttps: boolean
  port: string
  workspacePath: string
}

export type Config = {
  subdomains: Record<string, WorkspaceConfig>
}
export type WorkspaceConfig = {
  apiKey: string
  options: StartOptions
  publicHostServerHost: string
  subdomain: string
  workspacePath: string
}
