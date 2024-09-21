import yaml from 'js-yaml'
import fs from 'fs/promises'
import path from 'path'
import 'dotenv/config.js'
import { fileURLToPath } from 'url'

import * as deepl from 'deepl-node'

const cacheDeepl = true

const __dirname = path.dirname(fileURLToPath(new URL(import.meta.url)))

let deeplCache = JSON.parse(await fs.readFile(__dirname + '/deepl_cache.json'))

const deeplApiKey = process.env['DEEPL_AUTH_KEY']

let sourceLanguage = null
let targetLanguages = null
let customTranslationYaml = __dirname + '/../i18n/yaml/custom_translations.yml'

for (let arg of process.argv) {
  if (arg.startsWith('--sourceLanguage=')) {
    sourceLanguage = arg.split('=')[1]
  }
  if (arg.startsWith('--targetLanguages=')) {
    targetLanguages = arg.split('=')[1].split(',')
  }
}

if (!targetLanguages || targetLanguages.length === 0) {
  console.error(
    'Please specify target language(s), e.g. --targetLanguages=de,fr,es'
  )
  process.exit(1)
}

if (!sourceLanguage) {
  console.error('Please specify source language, e.g. --sourceLanguage=en')
  process.exit(1)
}

let customTranslations = yaml.load(
  await fs.readFile(customTranslationYaml, {
    encoding: 'utf-8',
  })
)

const translator = deeplApiKey ? new deepl.Translator(deeplApiKey) : null

async function translateJSON(yamlFile, targetLanguages) {
  const obj = JSON.parse(await fs.readFile(yamlFile, { encoding: 'utf-8' }))
  const translations = {}
  for (let targetLang of targetLanguages) {
    if (targetLang === sourceLanguage) {
      continue
    }

    let texts = []
    translations[targetLang] = {}
    for (let key in obj[sourceLanguage]) {
      let val = obj[sourceLanguage][key].replace(
        /\%\{(.+?)}/,
        '<ignore>$1</ignore>'
      )

      texts.push([key, val])
    }

    // let text = texts.map((v) => v[1])

    let textToTranslate = []

    for (let text of texts) {
      let cacheKey = `${sourceLanguage}:${targetLang}:${text[0]}`
      if (cacheDeepl && deeplCache[cacheKey]) {
        translations[targetLang][text[0]] = deeplCache[cacheKey]
        continue
      } else {
        textToTranslate.push(text)
      }
    }

    let values = textToTranslate.map((v) => v[1])

    if (values.length === 0) {
      continue
    }

    if (!deeplApiKey) {
      throw Error(
        'Please define eine env variable `DEEPL_AUTH_KEY` to use the translation feature (see https://www.deepl.com/docs-api/api-access)'
      )
    }

    if (!translator) {
      throw Error('Could not initialize deepl translator')
    }

    const results = await translator.translateText(
      values,
      sourceLanguage,
      targetLang,
      {
        tagHandling: 'xml',
        ignoreTags: ['ignore'],
      }
    )

    results.forEach((result, i) => {
      textToTranslate[i][2] = result.text
    })
    textToTranslate.forEach((v) => {
      let cacheKey = `${sourceLanguage}:${targetLang}:${v[0]}`
      let translation = v[2].replace(/<ignore>(.+?)<\/ignore>/, '%{$1}')
      translations[targetLang][v[0]] = deeplCache[cacheKey] = translation
    })
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

if (!filename.toLowerCase().endsWith('.json')) {
  console.error('Please specify a JSON file to translate as last argument')
  process.exit(1)
}

if (targetLanguages.length > 0) {
  console.debug(`\n\nTranslate to languages: ${targetLanguages.join(', ')}`)
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
