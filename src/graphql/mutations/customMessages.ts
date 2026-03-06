export const CUSTOM_MESSAGES_INSERT = `
  mutation localeMessagesInsert(
    $localeMessages: [locale_message_insert_input!] = {}
    $countryCodesPage: [locale_countryCodesPage_insert_input!] = {}
  ) {
    insert_locale_message(
      objects: $localeMessages
      on_conflict: {
        constraint: message_pkey
        update_columns: [localeTo, localeFrom, textTo, textFrom]
      }
    ) {
      returning {
        textTo
        textFrom
        localeTo
        localeFrom
        id
      }
    }
    insert_locale_countryCodesPage(
      objects: $countryCodesPage
      on_conflict: {
        constraint: countriesMessage_pkey
        update_columns: [countryCodes, pageName, storeId, translateBulkJobId]
      }
    ) {
      returning {
        countryCodes
        id
        pageName
        storeId
      }
    }
  }
`;

export const CUSTOM_MESSAGES_DELETE = `
  mutation localeMessagesDelete(
    $messageIds: [bigint!]
    $countryCodesPageIds: [bigint!]
    $linkIds: [bigint!]
  ) {
    delete_locale_countryCodesPageMessageLink(
      where: { id: { _in: $linkIds } }
    ) {
      returning {
        id
      }
    }
    delete_locale_message(where: { id: { _in: $messageIds } }) {
      returning {
        id
      }
    }
    delete_locale_countryCodesPage(
      where: { id: { _in: $countryCodesPageIds } }
    ) {
      returning {
        id
      }
    }
  }
`;
