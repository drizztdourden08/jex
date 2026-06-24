import type { IpcApi } from '@shared/ipc/api'
import type * as React from 'react'

export {}

declare global {
  /** The Electron <webview> tag (enabled via webviewTag) used by the Store tab. */
  namespace JSX {
    interface IntrinsicElements {
      webview: React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string
          partition?: string
          allowpopups?: boolean
          useragent?: string
          ref?: React.Ref<HTMLElement>
        },
        HTMLElement
      >
    }
  }

  interface Window {
    /** Typed bridge exposed by the preload — the single source is @shared/ipc/api. */
    api: IpcApi
  }
}
