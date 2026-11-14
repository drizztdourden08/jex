// Belt and braces: SDK error text should never hold the key, but if it ever did it
// must not reach logs, the UI or the plugin.
const scrub = (text: string, key: string): string => (key.length > 8 ? text.split(key).join('[key]') : text)

export { scrub }
