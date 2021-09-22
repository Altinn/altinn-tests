/// <reference types='cypress' />
import { partySelect } from '../../pageobjects/partyselect'

describe('Altinn Login', () => {
  beforeEach(() => {
    cy.visit('/ui/authentication')
  })

  it('Login with AltinnPin', () => {
    cy.loginWithPin(Cypress.env('pinUser'), 'ajhhs')
    cy.get(partySelect.search).type(Cypress.env('pinUser'))
    cy.get(partySelect.reporteeSelf).find(partySelect.reporteeButton).should('be.visible')
  })

  it('Login with AltinnPassword', () => {
    cy.loginWithPassword(Cypress.env('passwordUser'), Cypress.env('password'))
    cy.get(partySelect.search).type(Cypress.env('passwordUser'))
    cy.get(partySelect.reporteeSelf).find(partySelect.reporteeButton).should('be.visible')
  })
})
