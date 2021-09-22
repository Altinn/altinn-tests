const path = require('path')
const fs = require('fs-extra')
const pdf = require('pdf-parse')

const downloadsPath = path.join(__dirname, '..', '..', 'downloads')

function getJsonDataFromFile(pathToFile, file) {
  const pathToJsonDataFile = path.resolve(pathToFile, `${file}.json`)
  return fs.readJson(pathToJsonDataFile)
}

module.exports = async (on, config) => {
  on('task', {
    getPdfContent(pdfName) {
      const pdfPathname = path.join(downloadsPath, pdfName)
      let dataBuffer = fs.readFileSync(pdfPathname)
      return pdf(dataBuffer)
    },
  })

  var baseUrls = await getJsonDataFromFile('src/config', 'baseurl')
  switch (config.env.environment) {
    case 'at21':
      config.baseUrl = baseUrls.at21
      config.env = await getJsonDataFromFile('src/data', 'at21')
      break
    case 'at22':
      config.baseUrl = baseUrls.at22
      config.env = await getJsonDataFromFile('src/data', 'at22')
      break
    case 'at23':
      config.baseUrl = baseUrls.at23
      config.env = await getJsonDataFromFile('src/data', 'at23')
      break
    case 'at24':
      config.baseUrl = baseUrls.at24
      config.env = await getJsonDataFromFile('src/data', 'at24')
      break
    case 'tt02':
      config.baseUrl = baseUrls.tt02
      config.env = await getJsonDataFromFile('src/data', 'tt02')
      break
    case 'prod':
      config.baseUrl = baseUrls.prod
      config.env = await getJsonDataFromFile('src/data', 'prod')
      break
  }

  return config
}
