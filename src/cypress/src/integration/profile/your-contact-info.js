/// <reference types='cypress' />
import { partySelect } from '../../pageobjects/partyselect'
import { header } from '../../pageobjects/header'
import { yourContactInfo } from '../../pageobjects/profile/your-contact-info'

describe('Your contact information', () => {
  before(() => {
    cy.visit('/ui/authentication')
  })

  it('Adress field is not empty', () => {
    cy.loginWithPin(Cypress.env('pinUser'), 'ajhhs')
    cy.get(partySelect.search).type(Cypress.env('pinUser'))
    cy.get(partySelect.reporteeSelf).find(partySelect.reporteeButton).should('be.visible').click()
    cy.get(header.nav).find(header.navList.profile).should('be.visible').click()
    cy.get(yourContactInfo.header).should('be.visible').click()
    cy.get(yourContactInfo.address).should('exist').invoke('attr', 'value').should('not.be.empty')
  })
})
