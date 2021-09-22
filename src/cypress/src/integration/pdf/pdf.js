/// <reference types='cypress' />
import { partySelect } from '../../pageobjects/partyselect'
import { common } from '../../pageobjects/messagebox/common'
import * as texts from '../../fixtures/texts.json'

describe('PDF', () => {
  before(() => {
    cy.visit('/ui/authentication')
  })

  it('Verify Pdf downloaded from an archived reporting service', () => {
    cy.loginWithPin(Cypress.env('pinUser'), 'ajhhs')
    cy.get(partySelect.search).type(Cypress.env('pinUser'))
    cy.get(partySelect.reporteeSelf).find(partySelect.reporteeButton).should('be.visible').click()
    cy.get(common.archives).click()
    cy.get('.row.a-inboxHeadingContent').click()
    cy.get('div[id*="accordionItem-messageBox"]').find('button[onclick*="RedirectToArchivedElement"]').click()
    cy.get('a[id*=ReceiptPrintFormSet]').click()
    cy.readFile(`${Cypress.config('downloadsFolder')}/${texts.accSecurityLevel2Mag}.pdf`, 'binary').should('exist')
    cy.task('getPdfContent', `${texts.accSecurityLevel2Mag}.pdf`).then((content) => {
      expect(content.numpages).to.equal(2)
      expect(content.text).contains('RF-1117')
    })
  })
})
