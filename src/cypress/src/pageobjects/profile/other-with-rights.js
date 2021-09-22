export const otherWithRights = {
  header: '#othersWithRightsHeader',
  expanded: '#andremedrettigheter',
  addNewRights: '#addNewRightHolder',
  button: 'button[class*="a-btn"]',
  receipt: '.a-modal-receiptContent',
  done: '.a-btn-success',
  rightHolder: 'li[class="a-list-parentRightHolder"]',
  addReportee: {
    SSN: {
      tab: 'a[href="#person"]',
      idName: '#NewRightHolder_NewRightHolderPerson_SsnUsername',
      surName: '#NewRightHolder_NewRightHolderPerson_Surname',
      next: '#submitAddNewPerson',
    },
  },
  editRolesAndRightForm: {
    form: '#EditRolesAndRightForm',
    servicesList: '#serviceListIdInputDelegate',
    searchResults: 'li[role="menu"][id*="search"]',
    removeRights: 'button[class*="a-linkDanger"]',
    removeAll: 'label[for="delete-all-rights-checkbox"]',
  },
  delegateRightsForm: {
    form: '#delegateRightsForm',
    read: 'input[id*="Read"][name="addRights"]',
    write: 'input[id*="Write"][name="addRights"]',
    sign: 'input[id*="Sign"][name="addRights"]',
    submit: '#submit-email-rights',
  },
  submitemailform: {
    form: '#submitemailform',
    emailId: '#SubmitEmail_Input',
    submit: '#submitEmailbt',
  },
}
