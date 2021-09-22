/// <reference types='cypress' />
import { login } from '../pageobjects/login'
import * as pins from '../data/pin.json'

/**
 * Find the second pin to type and enter it
 */
Cypress.Commands.add('typePinTwo', (pinSet) => {
  cy.get(login.altinnPin.pinTwoText).then((label) => {
    const labelText = label.text()
    const pinNo = labelText.replace(/Kode |Code number /s, '').split(' ')[0]
    cy.get(login.altinnPin.pinTwo).type(pinSet == 'ajhhs' ? pins[parseInt(pinNo)] : pins[0], { log: false })
  })
})

/**
 * Login with altinnpin with the pin set
 */
Cypress.Commands.add('loginWithPin', (userName, pinSet) => {
  cy.get(login.altinnPin.form).find(login.userName).should('be.visible').type(userName, { log: false })
  cy.get(login.altinnPin.pinOne).type(pinSet == 'ajhhs' ? pins[1] : pins[0], { log: false })
  cy.get(login.altinnPin.submitPinOne).click()
  cy.typePinTwo(pinSet)
  cy.get(login.altinnPin.submitPinTwo).click()
})

/**
 * Login with altinn password
 */
Cypress.Commands.add('loginWithPassword', (userName, password) => {
  cy.get(login.altinnPwd.passwordTab).should('be.visible').click()
  cy.get(login.altinnPwd.form).find(login.userName).should('be.visible').type(userName, { log: false })
  cy.get(login.altinnPwd.password).type(password, { log: false })
  cy.get(login.altinnPwd.submit).click()
})
