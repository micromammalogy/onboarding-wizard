export const CHECKOUT_SETTINGS_UPDATE = `
  mutation checkoutSettingsUpdate(
    $input: CheckoutSettingsUpdateInput!
    $allowedDomains: [String!]!
  ) {
    checkoutSettingsUpdate(input: $input) {
      companyFieldsStatus
      orderCombinationRefundDistributionStatus
      orderNotifications {
        merchantOrderConfirmation {
          active
          sendCopiesTo
        }
        orderShipped {
          active
          sendCopiesTo
        }
        orderCancelled {
          active
          sendCopiesTo
        }
      }
      placeOrderButtonSelector
      successBehavior
      successRedirectUrl
      id
    }
    onlineStoreSettingsUpdate(input: { allowedDomains: $allowedDomains }) {
      allowedDomains
    }
  }
`;
