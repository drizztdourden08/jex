// Pin the app name BEFORE anything resolves app.getPath('userData'). ESM evaluates
// imports before the importing module's body, and electron-store (via settings.ts)
// reads userData the moment it's constructed at import time — so setName() in index's
// body ran too late and userData stuck under the package name "@jex/desktop". Importing
// this module FIRST guarantees the name is "Jex" before that first userData access.
// (Packaged builds already use productName "Jex"; this fixes dev + keeps them identical.)
import { app } from 'electron'

app.setName('Jex')

// Dev/test only: JEX_USER_DATA=<abs dir> runs against a copied profile so a test
// launch never touches the real AppData\Roaming\Jex.
if (process.env.JEX_USER_DATA) app.setPath('userData', process.env.JEX_USER_DATA)
