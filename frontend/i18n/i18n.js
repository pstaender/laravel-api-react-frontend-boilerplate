import {
  setTranslations,
  setLocale,
//   setHandleMissingTranslation,
} from 'react-i18nify'
import { en } from './en.json'

const debug = import.meta.env.DEV || window?.location?.host?.startsWith('localhost')

const lang = (navigator ? navigator.language : 'en').replace(/(-.+?)$/, '')

export const translations = {
  en,
}

if (debug) {
  console.debug(`Selected language (i18nify): ${lang}`)
  console.debug(`Translations (i18nify)`, translations)
}

// setHandleMissingTranslation((value, options, err) =>
//   value?.replace(/%{dot}/g, '.')
// )

setTranslations(translations)
setLocale(translations[lang] ? lang : 'en')
