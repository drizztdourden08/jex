/** The subset of the Electron <webview> API the title-bar controls drive. */
interface SteamWebview extends HTMLElement {
  canGoBack(): boolean
  canGoForward(): boolean
  goBack(): void
  goForward(): void
  reload(): void
  stop(): void
  loadURL(url: string): Promise<void>
  /** Run JS in the guest page and resolve with its (serializable) return value. */
  executeJavaScript(code: string): Promise<unknown>
}

export type { SteamWebview }
