declare module 'winreg' {
  interface RegistryItem {
    name: string
    type: string
    value: string
  }
  interface RegistryOptions {
    hive: string
    key: string
  }
  interface RegistryInstance {
    get(name: string, cb: (err: Error | null, item: RegistryItem) => void): void
    values(cb: (err: Error | null, items: RegistryItem[]) => void): void
    keys(cb: (err: Error | null, items: RegistryInstance[]) => void): void
  }
  interface RegistryConstructor {
    new (options: RegistryOptions): RegistryInstance
    HKLM: string
    HKCU: string
    HKCR: string
    HKU: string
    HKCC: string
  }
  const Registry: RegistryConstructor
  export default Registry
}
