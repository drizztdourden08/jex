<p align="center">
  <img src="apps/desktop/assets/icon.png" alt="Jex logo" width="120" />
</p>

<p align="center">
  <img src="apps/desktop/assets/wordmark.svg" alt="Jex" width="120" />
</p>

![Platform](https://img.shields.io/badge/platform-Windows-0078D6)
![Electron](https://img.shields.io/badge/Electron-33-47848F?logo=electron&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue)
[![Release](https://img.shields.io/github/v/release/drizztdourden08/jex?include_prereleases&sort=semver)](https://github.com/drizztdourden08/jex/releases)

## The context
Frustrated by steam library being what it is, and my huge 1500+ games in it, I was never really satisfied with the functionalities that steam itself had. I often go in my own library to "shop" for games instead of buying, having so many games that I never played anyway. However, that also meant using the bad search features and filtering, and constantly going in the store page to see the details of a game and the videos or image. I wanted something faster and I decided, a few years ago, to build one for myself quickly.

I made it evolve with my own needs for years, adding little by little to it, either for fun or for actual needs and ended up in the current state. 

I recently decided that it might be worth it to other people as well and to share it publicly.

## What you need
- **[Steam Web API key](https://steamcommunity.com/dev/apikey)**

The above is the only actual requirement for most functionalities. It takes seconds to get one with any valid steam account.
  
## What it does

- **Setup-free start**: auto-detects your Steam install (registry + library
  folders) and shows your *installed* games with cover art, with no key and no
  network.
- **Full library mirror**: pulls your complete owned library.
- **Rich metadata**: Pulling from Steam and a few other places (metacritics for example), you get a rich assets of metadata to use filters with.
- **Search & Filter**: 3 mode for searching. 
    - Basic: just text
    - Normal: Additive UI friendly filtering with tags, features, genre, and categories, scores, and text. Probably good for most users.
    - Advanced: A fully advanced query system that can do negation on any metadata available.
- Multiple tabs:
    - Store: Just browse steam website, simply.
    - Search: Search accross Steam huge library with the same UI as the rest and with slightly better filtering capabilities. (Never been a fan of steam integrated search)
    - Wishlist: I always wanted to have multiple wishlist and this was one of the first feature I developed years ago.
    - Library: Just everything you own, including installed one. You can install from here or play a game. Will simply ask steam to do it.
    - Randomizer: Want to play a random game in your library, wishlist or even in the store. Use that to find one. 
    - Settings: Just the settings page for the various things in the app
- **AI Assistant**: The most recent thing I did to play with these tool was add this feature. It's completly optional and not even in the base software. If you want to play with it, go in setting, and install the plugin for your CPU and GPU. Then you'll get access to download a model of your choice. Those models are all open source and local, so it cost you nothing except some local resources on your computer. You can ask the assitant to navigate through the app to help you, and it will learn your teste as you use it. You can have him recommend you games based on your overall taste and what you played accross your library or to use advanced filters for you. It knows how the steam website is laid out so it can bring you to the right page if you're searching for something.

## Download

Grab the latest **Windows** build from the
[Releases page](https://github.com/drizztdourden08/jex/releases):

- **Portable (.exe)** — run it, no installation.
- **Installer (.exe)** — standard setup with a desktop shortcut.

## Requirements
Only tested on Windows. Theorically can run on Linux or MacOS but not tested. If there is interest, I might make it compatible so ask for it in an issue if that's the case.

- **Windows 10/11.**
- **Steam** installed

AI Assistant:
- Depends on the model chosen mainly. Specs and requirement are lister in the settings of the app directly.
## License

[MIT](LICENSE).
