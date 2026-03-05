export const HELLO_SETTINGS_QUERY = `
  query helloCheckoutSettings {
    helloSettings {
      anchorElementSelector
      cartUrlPattern
      currencyBehavior
      currencyElementSelector
      dutyTaxEstimationBehavior
      excludedUrlPatterns
      homepageUrlPattern
      mobileLocation
      peekMessageBehavior
      peekMessageDelay
      productDetailUrlPattern
      productListUrlPattern
      restrictionBehavior
      productTitleElementSelector
      productDescriptionElementSelector
      productAddToCartElementSelector
    }
    onlineStoreSettings {
      allowedDomains
    }
  }
`;

export type IHelloSettings = {
  anchorElementSelector: string;
  cartUrlPattern: string | null;
  currencyBehavior: 'ENABLED' | 'DISABLED';
  currencyElementSelector: string;
  dutyTaxEstimationBehavior: 'ENABLED' | 'DISABLED';
  excludedUrlPatterns: string[];
  homepageUrlPattern: string | null;
  mobileLocation: 'BOTTOM_LEFT' | 'BOTTOM_RIGHT' | 'TOP_LEFT' | 'TOP_RIGHT';
  peekMessageBehavior: 'ENABLED' | 'DISABLED';
  peekMessageDelay: number;
  productDetailUrlPattern: string | null;
  productListUrlPattern: string | null;
  restrictionBehavior: 'DISABLED' | 'RESTRICT_AND_BLOCK' | 'RESTRICT_AND_WARN';
  productTitleElementSelector: string | null;
  productDescriptionElementSelector: string | null;
  productAddToCartElementSelector: string | null;
};

export type IHelloSettingsData = {
  helloSettings: IHelloSettings;
  onlineStoreSettings: {
    allowedDomains: string[];
  };
};
