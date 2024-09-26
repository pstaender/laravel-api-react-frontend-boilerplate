import { translate } from 'react-i18nify'

export function t(key, replacements = {}, options = {}) {
  key = key.replace(/\./g, '_')
  console.log(key)
  return translate(key, replacements, options)
}
