# 🎮 Jex

![Platform](https://img.shields.io/badge/platform-Windows-0078D6)
![Electron](https://img.shields.io/badge/Electron-33-47848F?logo=electron&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue)
[![Release](https://img.shields.io/github/v/release/drizztdourden08/jex?include_prereleases&sort=semver)](https://github.com/drizztdourden08/jex/releases)

A **local desktop app** (Electron) that mirrors your Steam library — installed
*and* not-installed games, with full metadata, screenshots, and trailers — and
lets you **filter, randomize, and AI-query** it through a glass ("Aurora") UI. It
runs entirely on your machine: local Steam files + your own Steam Web API key, with
a small local AI model. No server, no cloud account.

> 🚧 In active development. Engineering standards live in
> [docs/contributing/coding-standards.md](docs/contributing/coding-standards.md).

## What it does

- **Setup-free start** — auto-detects your Steam install (registry + library
  folders) and shows your *installed* games with cover art, with no key and no
  network.
- **Full library mirror** — with your Steam Web API key, pulls your complete owned
  library (incl. not-installed games), playtime, and rich metadata + media from the
  Steam Web/Store APIs into a local SQLite store.
- **AI search** — a local model (no key, no account) you set up from Settings turns
  "a random roguelite with base building I haven't played" into a query over your
  library, from a command bar at the top of the window.
- **Randomizer + filtering** — roll a pick across any metadata; browse, filter, and
  open a game for screenshots and trailers.

## Download

Grab the latest **Windows** build from the
[Releases page](https://github.com/drizztdourden08/jex/releases):

- **Portable (.exe)** — run it, no installation.
- **Installer (.exe)** — standard setup with a desktop shortcut.

## Requirements

- **Windows 10/11.**
- **Steam** installed (for setup-free detection of installed games).
- A free **[Steam Web API key](https://steamcommunity.com/dev/apikey)** to mirror
  your full owned library (optional — installed games work without one).
- ~2 GB free space for the AI: the engine (installed from **Settings → AI engine**,
  ~25 MB for CPU+Vulkan) plus a model you download from the model picker there.

## Run it (development)

A [pnpm](https://pnpm.io) monorepo — the app is `apps/desktop`, with shared packages
and the AI plugins. Run scripts from the repo root:

```bash
pnpm install
pnpm dev             # launches the app with hot reload
pnpm dev:nofocus     # same, but the window opens inactive (won't steal focus)
```

Then open **Settings** to paste your Steam Web API key (put `localhost` as the
domain) and to install the AI engine. SteamID is auto-detected.

## Build & package

```bash
pnpm build           # electron-vite build → apps/desktop/out/
pnpm package:win     # Windows installer + portable → apps/desktop/release/
pnpm verify          # typecheck + lint + css/structure policies + build (all packages)
pnpm --filter @jex/plugins build   # build the signed AI plugins → plugins/dist/
```

To cut a release, add `release-notes/vX.Y.Z.md`, then `pnpm release -- X.Y.Z`
(see [the release flow](.github/workflows/release.yml)). CI builds + signs the AI
plugins and attaches them to the release; the app fetches them on first use.

## Privacy & storage

Everything lives on your machine under the OS app-data directory: the library
mirror (SQLite), settings (`electron-store`), and **encrypted** secrets (Electron
`safeStorage`). Your Steam key is sent only to Steam; nothing is uploaded anywhere.

## Tech

pnpm monorepo · Electron · electron-vite · React 18 + TypeScript (strict) · `sql.js`
(WASM SQLite) · electron-store + safeStorage · `@node-steam/vdf` + `winreg` (detection).
The AI ships as a **downloadable, Ed25519-signed plugin** (`node-llama-cpp` engine +
native backend), kept out of the app so the download stays small. See
[CLAUDE.md](CLAUDE.md) and the [engineering skill](.claude/skills/jex/SKILL.md).

## License

[MIT](LICENSE).
