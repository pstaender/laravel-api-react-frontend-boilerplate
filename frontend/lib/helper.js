import { translate } from 'react-i18nify'

export function t(key, replacements = {}, options = {}) {
  key = key.replace(/\./g, '_')
  return translate(key, replacements, options)
}
