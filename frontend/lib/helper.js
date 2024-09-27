import { translate } from 'react-i18nify'

let displayedDebugTranslationKeys = []

export function t(key, replacements = {}, options = {}) {
  key = key.replace(/\./g, '_')
  if (import.meta.env.DEV && !displayedDebugTranslationKeys.includes(key)) {
    console.debug(key)
    // prevents showing up multiple times during interaction
    displayedDebugTranslationKeys.push(key)
  }
  return translate(key, replacements, options)
}
