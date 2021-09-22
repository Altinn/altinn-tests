/// <reference types='cypress' />
const baseUrl = Cypress.config('baseUrl')
const xml2js = require('xml2js')

/**
 * Custom command to send correspondence to a reportee
 */
Cypress.Commands.add('sendCorrespondence', (reportee) => {
  cy.readFile('src/fixtures/correspondence.xml').then((xml) => {
    xml2js.parseString(xml, (err, result) => {
      if (err) {
        throw err
      }

      var updatedBody = {
        'ns:systemUserName': [Cypress.env('serviceOwner').systemUserName],
        'ns:systemPassword': [Cypress.env('serviceOwner').systemPassword],
        'ns:SystemUserCode': [Cypress.env('serviceOwner').systemUserName],
        'ns:ExternalShipmentReference': [`EUF_${Math.floor(Math.random() * 100000)}`],
      }
      Object.assign(result['soapenv:Envelope']['soapenv:Body'][0]['ns:InsertCorrespondenceBasicV2'][0], updatedBody)

      var updatedCorrespondence = {
        'ns1:ServiceCode': [Cypress.env('services').correspondence.split(':')[0]],
        'ns1:ServiceEdition': [Cypress.env('services').correspondence.split(':')[1]],
        'ns1:Reportee': [reportee],
      }
      Object.assign(
        result['soapenv:Envelope']['soapenv:Body'][0]['ns:InsertCorrespondenceBasicV2'][0]['ns:Correspondence'][0],
        updatedCorrespondence,
      )

      const builder = new xml2js.Builder()
      const builtCorrespondenceXml = builder.buildObject(result)

      return cy.request({
        method: 'POST',
        url: `${baseUrl}/ServiceEngineExternal/CorrespondenceAgencyExternalBasic.svc`,
        headers: {
          'Content-Type': 'text/xml;charset=UTF-8',
          SOAPAction:
            'http://www.altinn.no/services/ServiceEngine/Correspondence/2009/10/ICorrespondenceAgencyExternalBasic/InsertCorrespondenceBasicV2',
        },
        body: builtCorrespondenceXml,
      })
    })
  })
})
