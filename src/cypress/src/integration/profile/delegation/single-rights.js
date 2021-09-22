/// <reference types = "cypress"/>
import { partySelect } from '../../../pageobjects/partyselect'
import { header } from '../../../pageobjects/header'
import { otherWithRights } from '../../../pageobjects/profile/other-with-rights'
import * as texts from '../../../fixtures/texts.json'

describe('Delegation', function () {
  before(() => {
    cy.visit('/ui/authentication')
  })

  it('Delegate Single rigths', function () {
    cy.loginWithPin(Cypress.env('delegation').offeredBy, '12345')
    cy.get(partySelect.search).type(Cypress.env('delegation').offeredBy)
    cy.get(partySelect.reporteeSelf).find(partySelect.reporteeButton).should('be.visible').click()
    cy.get(header.nav).find(header.navList.profile).should('be.visible').click()
    cy.get(otherWithRights.header).should('be.visible').click()
    cy.get(otherWithRights.addNewRights).find(otherWithRights.button).click()
    cy.get(otherWithRights.addReportee.SSN.idName).should('be.visible').type(Cypress.env('delegation').coveredBy)
    cy.get(otherWithRights.addReportee.SSN.surName).type(Cypress.env('delegation').coveredByName).blur()
    cy.get(otherWithRights.addReportee.SSN.next).click()
    cy.get(otherWithRights.editRolesAndRightForm.servicesList).should('be.visible').type(texts.accSecurityLevel2Mag)
    cy.contains(otherWithRights.editRolesAndRightForm.searchResults, texts.accSecurityLevel2Mag)
      .should('be.visible')
      .click()
    cy.get(otherWithRights.delegateRightsForm.read).parent().click()
    cy.get(otherWithRights.delegateRightsForm.submit).click()
    cy.get(otherWithRights.submitemailform.emailId).should('be.visible').focus().type('test@mail.com').blur()
    cy.get(otherWithRights.submitemailform.submit).should('be.enabled').click()
    cy.get(otherWithRights.receipt).siblings(otherWithRights.done).should('be.visible').click()
    //Delete delegation made to user
    cy.get(otherWithRights.expanded).should('be.visible')
    cy.contains(otherWithRights.rightHolder, Cypress.env('delegation').coveredByName).click()
    cy.get(otherWithRights.editRolesAndRightForm.form)
      .find(otherWithRights.editRolesAndRightForm.removeRights)
      .should('be.visible')
      .click()
    cy.get(otherWithRights.editRolesAndRightForm.removeAll).click()
    cy.get(otherWithRights.editRolesAndRightForm.form).find(otherWithRights.done).should('be.visible').click()
    cy.get(otherWithRights.receipt).siblings(otherWithRights.done).should('be.visible').click()
  })
})
