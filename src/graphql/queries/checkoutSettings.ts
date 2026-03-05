export const CHECKOUT_SETTINGS_QUERY = `
  query checkoutSettings {
    checkoutSettings {
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
      subscriptionStatus
      visibilityStatus
      id
    }
    onlineStoreSettings {
      allowedDomains
    }
  }
`;

type INotificationStatus = {
  active: 'ENABLED' | 'DISABLED';
  sendCopiesTo: string[];
};

export type ICheckoutSettings = {
  companyFieldsStatus: 'ENABLED' | 'DISABLED';
  orderCombinationRefundDistributionStatus: 'ENABLED' | 'DISABLED';
  orderNotifications: {
    merchantOrderConfirmation: INotificationStatus;
    orderShipped: INotificationStatus;
    orderCancelled: INotificationStatus;
  };
  placeOrderButtonSelector: string;
  successBehavior: 'ZONOS_SUCCESS_PAGE' | 'REDIRECT_TO_SUCCESS_PAGE' | 'CLOSE_MODAL';
  successRedirectUrl: string;
  subscriptionStatus: string;
  visibilityStatus: string;
  id: string;
};

export type ICheckoutSettingsData = {
  checkoutSettings: ICheckoutSettings;
  onlineStoreSettings: {
    allowedDomains: string[];
  };
};
