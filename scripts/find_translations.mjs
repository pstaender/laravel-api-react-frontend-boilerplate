import fs from 'fs/promises'
import path from 'path'
import yaml from 'js-yaml'
import { fileURLToPath } from 'url'

// TODO: make this as an argument
const language = 'en'

let fields = {}

const __dirname = path.dirname(fileURLToPath(new URL(import.meta.url)))
let customTranslationYaml = `${__dirname}/../i18n/yaml/${language}.yml`
let customTranslations = null
try {
  customTranslations = yaml.load(
    await fs.readFile(customTranslationYaml, {
      encoding: 'utf-8',
    })
  )
} catch (e) {
  console.error(e)
}

let delimiterFound = false
let files = process.argv.filter((f) => {
  if (f === '--') {
    delimiterFound = true
    return false
  }
  return delimiterFound
})

for (let file of files) {
  let ext = path.extname(file)
  const content = await fs.readFile(file, 'utf-8')
  let pattern =
    ext.toLowerCase() === '.php'
      ? /[\W]__\([\s\n]*[\'"`](.+?)[\'"`][\s\n]*\)/g
      : /[\W]t\([\s\n]*[\'"`](.+?)[\'"`][\s\n]*\)/g
  // console.debug(file);
  for (let match of content.matchAll(pattern)) {
    // replace all dots with underscores
    fields[match[1].replace(/\./g, '_')] = match[1]
  }
}

let result = {}

result[language] = fields

if (customTranslations && customTranslations[language]) {
  result[language] = { ...result[language], ...customTranslations[language] }
}

console.log(JSON.stringify(result, null, 2))
