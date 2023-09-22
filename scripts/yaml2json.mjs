import yaml from 'js-yaml'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

import * as deepl from 'deepl-node'

const __dirname = path.dirname(fileURLToPath(new URL(import.meta.url)))
const deeplApiKey = process.env['DEEPL_AUTH_KEY']
const targetLanguages =
  process.argv
    .filter((v) => v.startsWith('--lang='))
    .map((v) => v.substring(7))[0]
    ?.split(',')
    .map((v) => v.toLowerCase()) || []
const translator = deeplApiKey ? new deepl.Translator(deeplApiKey) : null

async function translateYaml(yamlFile, targetLanguages) {
  const obj = yaml.load(await fs.readFile(yamlFile, { encoding: 'utf-8' }))
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
    const results = await translator.translateText(
      texts.map((v) => v[1]),
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
  }
  return translations
}

async function convertYamlToJSON(yamlFile) {
  const outputJSON = yamlFile.replace(/\.yml$/i, '.json')
  const obj = yaml.load(await fs.readFile(yamlFile, { encoding: 'utf-8' }))

  let jsonString = JSON.stringify(obj, null, 2)

  return {
    content: jsonString,
    outputFilename: outputJSON,
  }
}

async function convertYamlToLaravelI18nJson(yamlFile) {
  let { content, outputFilename } = await convertYamlToJSON(yamlFile)
  // simplified global string change from %{var} to :var
  let laravelTranslation = JSON.parse(content.replace(/\%\{(.+?)\}/g, ':$1'))
  laravelTranslation = laravelTranslation[Object.keys(laravelTranslation)[0]]
  return {
    content: JSON.stringify(laravelTranslation, null, 2),
    outputFilename: `${__dirname}/../api/lang/${path.basename(outputFilename)}`,
  }
}

let filename = process.argv[process.argv.length - 1]

if (targetLanguages.length > 0) {
  console.debug(`Translate to languages: ${targetLanguages.join(', ')}`)
  if (!deeplApiKey) {
    throw Error(
      'Please define eine env variable `DEEPL_AUTH_KEY` to use the translation feature (see https://www.deepl.com/docs-api/api-access)'
    )
  }
  let translations = await translateYaml(filename, targetLanguages)
  for (let targetLang of targetLanguages) {
    let data = {}
    data[targetLang] = translations[targetLang]
    let translatedYamlFile = filename.replace(
      /([a-z]{2})\.yml$/i,
      targetLang + '.yml'
    )
    await fs.writeFile(
      translatedYamlFile,
      `# auto-translated\n` + yaml.dump(data)
    )
    console.log(`${filename} -> ${translatedYamlFile}`)
  }
  process.exit()
}

var { content, outputFilename, translations } = await convertYamlToJSON(
  filename,
  targetLanguages
)

await fs.writeFile(outputFilename, content)
console.log(`${filename} -> ${outputFilename}`)
var { content, outputFilename } = await convertYamlToLaravelI18nJson(
  filename,
  targetLanguages
)
await fs.writeFile(outputFilename, content)
console.log(`${filename} -> ${outputFilename}`)
