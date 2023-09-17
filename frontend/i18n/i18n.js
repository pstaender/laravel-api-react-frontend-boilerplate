import { setTranslations, setLocale } from 'react-i18nify'
import { en } from './en.json'

const debug =
    process?.env?.NODE_ENV === 'development' ||
    window?.location?.host?.startsWith('localhost')

const lang = (navigator ? navigator.language : 'en').replace(/(\-.+?)$/, '')

const translations = {
    en,
}

if (debug) {
    console.debug(`Selected language (i18nify): ${lang}`)
    console.debug(`Translations (i18nify)`, translations)
}

setTranslations(translations)
setLocale(translations[lang] ? lang : 'en')
