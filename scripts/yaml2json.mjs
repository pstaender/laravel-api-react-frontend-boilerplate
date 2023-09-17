import yaml from 'js-yaml'
import fs from 'fs'

const inputYML = process.argv[process.argv.length - 1]
const outputJSON = inputYML.replace(/\.y[a]*ml$/i, '.json')
const obj = yaml.load(fs.readFileSync(inputYML, { encoding: 'utf-8' }))
fs.writeFileSync(outputJSON, JSON.stringify(obj, null, 2))

console.log(`${inputYML} -> ${outputJSON}`)
