/// <reference types='cypress' />
import { partySelect } from '../../pageobjects/partyselect'
import { header } from '../../pageobjects/header'
import { formsAndServices } from '../../pageobjects/profile/forms-and-services'
import { orgNotificationAddress } from '../../pageobjects/profile/notification-address-for-org'

describe('Organisation profile Information', () => {
  before(() => {
    cy.visit('/ui/authentication')
    cy.loginWithPin(Cypress.env('pinUser'), 'ajhhs')
    cy.get(partySelect.search).type(Cypress.env('OrgNum'))
    cy.selectOrgAsReportee()
  })
  beforeEach(() => {
    Cypress.Cookies.preserveOnce('altinnReportee', 'AltinnPartyId', '.ASPXAUTH')
    cy.get(header.nav).find(header.navList.profile).should('be.visible').click()
  })

  it('Org Forms and Services', () => {
    cy.get(formsAndServices.formsheader).should('be.visible').click()
    cy.get(formsAndServices.rolesList).should('exist').should('not.be.empty').should('contain', 'Daglig leder')
  })

  it('Org Notification Address', () => {
    cy.get(orgNotificationAddress.addressHeader).should('be.visible').click()
    cy.get(orgNotificationAddress.form).then((form) => {
      expect(form).to.exist
      cy.get(form)
        .get(orgNotificationAddress.eMails)
        .first()
        .get(orgNotificationAddress.eMail)
        .first()
        .should('be.visible')
        .focus()
        .clear()
        .type(`test${Math.floor(Math.random() * 10000)}@mail.com`)
      cy.get(form)
        .get(orgNotificationAddress.phoneNumbers)
        .first()
        .get(orgNotificationAddress.phoneNumber)
        .first()
        .focus()
        .clear()
        .type('91008912')
      cy.get(form).find(orgNotificationAddress.saveButton).should('be.visible').click()
    })
  })
})
