import yaml from 'js-yaml'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(new URL(import.meta.url)))

const inputYML = process.argv[process.argv.length - 1]
const outputJSON = inputYML.replace(/\.y[a]*ml$/i, '.json')
const obj = yaml.load(fs.readFileSync(inputYML, { encoding: 'utf-8' }))
let jsonString = JSON.stringify(obj, null, 2)
fs.writeFileSync(outputJSON, jsonString)

console.log(`${inputYML} -> ${outputJSON}`)

// simplified global string change from %{var} to :var
let laravelTranslation = JSON.parse(jsonString.replace(/\%\{(.+?)\}/g, ':$1'))
laravelTranslation = laravelTranslation[Object.keys(laravelTranslation)[0]]

fs.writeFileSync(
  `${__dirname}/../api/lang/${path.basename(outputJSON)}`,
  JSON.stringify(laravelTranslation, null, 2)
)
console.log(`${inputYML} -> api/lang/${path.basename(outputJSON)}`)
