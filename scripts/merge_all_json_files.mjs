import fs from 'fs/promises'

let data = {}

let delimiterFound = false
let files = process.argv.filter((f) => {
  if (f === '--') {
    delimiterFound = true
    return false
  }
  return delimiterFound
})

for (let file of files) {
  const content = await fs.readFile(file, 'utf-8')
  data = { ...data, ...JSON.parse(content) }
}

console.log(JSON.stringify(data, null, 2))
