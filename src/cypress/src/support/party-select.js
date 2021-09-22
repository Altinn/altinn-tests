/// <reference types='cypress' />
import { partySelect } from '../pageobjects/partyselect'

/**
 * Select the first reportee in list and click ask me later
 * when asked to confirm contact information
 */
Cypress.Commands.add('selectOrgAsReportee', () => {
  cy.get(partySelect.reporteeOthers)
    .children('div')
    .should('have.length', 1)
    .find(partySelect.reporteeButton)
    .should('be.visible')
    .click()
  cy.get(partySelect.updateContact.form).then(($form) => {
    if ($form.length) {
      cy.get(partySelect.updateContact.form).find(partySelect.updateContact.toInbox).click()
    }
  })
})
