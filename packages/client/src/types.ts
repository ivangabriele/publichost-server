export type StartOptions = {
  isHttps: boolean
  localhostAppPort: string
}

export type Config = {
  subdomains: Record<string, WorkspaceConfig>
}
export type WorkspaceConfig = {
  publicHostServerUrl: string
  subdomain: string
  options: StartOptions
  workspacePath: string
}
