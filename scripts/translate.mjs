import yaml from 'js-yaml'
import fs from 'fs/promises'
import path from 'path'
import 'dotenv/config.js'
import { fileURLToPath } from 'url'

import * as deepl from 'deepl-node'

const cacheDeepl = true

const __dirname = path.dirname(fileURLToPath(new URL(import.meta.url)))

let deeplCache = JSON.parse(await fs.readFile(__dirname + '/deepl_cache.json'))
let customTranslations = yaml.load(
  await fs.readFile(__dirname + '/../i18n/custom_translations.yml', {
    encoding: 'utf-8',
  })
)

const deeplApiKey = process.env['DEEPL_AUTH_KEY']
const targetLanguages =
  process.argv
    .filter((v) => v.startsWith('--lang='))
    .map((v) => v.substring(7))[0]
    ?.split(',')
    .map((v) => v.toLowerCase()) || []
const translator = deeplApiKey ? new deepl.Translator(deeplApiKey) : null

async function translateJSON(yamlFile, targetLanguages) {
  const obj = JSON.parse(await fs.readFile(yamlFile, { encoding: 'utf-8' }))
  const sourceLang = Object.keys(obj)[0]
  const translations = {}
  for (let targetLang of targetLanguages) {
    if (targetLang === sourceLang) {
      continue
    }

    let texts = []
    translations[targetLang] = {}
    for (let key in obj[sourceLang]) {
      let val = obj[sourceLang][key].replace(
        /\%\{(.+?)}/,
        '<ignore>$1</ignore>'
      )

      texts.push([key, val])
    }

    let text = texts.map((v) => v[1])

    let cacheKey = `${sourceLang}:${targetLang}:${text}`

    if (cacheDeepl && deeplCache[cacheKey]) {
      translations[targetLang] = deeplCache[cacheKey]
      continue
    }

    const results = await translator.translateText(
      text,
      sourceLang,
      targetLang,
      {
        tagHandling: 'xml',
        ignoreTags: ['ignore'],
      }
    )
    results.forEach((result, i) => {
      texts[i].push(result.text)
    })
    texts.forEach((v) => {
      translations[targetLang][v[0]] = v[2].replace(
        /<ignore>(.+?)<\/ignore>/,
        '%{$1}'
      )
    })
    if (cacheDeepl) {
      if (!deeplCache[cacheKey]) {
        deeplCache[cacheKey] = {}
      }
      deeplCache[cacheKey] = translations[targetLang]
    }
  }
  if (cacheDeepl) {
    await fs.writeFile(
      __dirname + '/deepl_cache.json',
      JSON.stringify(deeplCache, null, 2)
    )
  }
  return translations
}

let filename = process.argv[process.argv.length - 1]

if (targetLanguages.length > 0) {
  console.debug(`Translate to languages: ${targetLanguages.join(', ')}`)
  if (!deeplApiKey) {
    throw Error(
      'Please define eine env variable `DEEPL_AUTH_KEY` to use the translation feature (see https://www.deepl.com/docs-api/api-access)'
    )
  }
  let translations = await translateJSON(filename, targetLanguages)
  for (let targetLang of targetLanguages) {
    let data = {}
    // mergin custom translations back
    data[targetLang] = {
      ...translations[targetLang],
      ...customTranslations[targetLang],
    }
    let translatedYamlFile = filename.replace(
      /([a-z]{2})\.json$/i,
      targetLang + '.json'
    )
    await fs.writeFile(translatedYamlFile, JSON.stringify(data, null, '  '))
    console.log(`${filename} -> ${translatedYamlFile}`)
  }
  process.exit()
} else {
  console.error('Please specify languages to translate to')
  process.exit(1)
}
