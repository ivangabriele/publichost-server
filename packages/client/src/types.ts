export type StartOptions = {
  isHttps: boolean
  localhostAppPort: string
}

export type Config = {
  subdomains: Record<string, WorkspaceConfig>
}
export type WorkspaceConfig = {
  options: StartOptions
  publicHostServerHost: string
  subdomain: string
  workspacePath: string
}
