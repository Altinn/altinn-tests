/// <reference types='cypress' />
import * as texts from '../../fixtures/texts.json'

describe('Correspondence', () => {
  it('Send Correspondence', () => {
    cy.sendCorrespondence(Cypress.env('pinUser')).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).contains(texts.correspondenceSaved)
    })
  })
})
