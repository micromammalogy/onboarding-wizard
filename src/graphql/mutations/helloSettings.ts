export const HELLO_SETTINGS_UPDATE = `
  mutation helloSettingsUpdate(
    $input: HelloSettingsUpdateInput!
    $allowedDomains: [String!]!
  ) {
    helloSettingsUpdate(input: $input) {
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
    onlineStoreSettingsUpdate(input: { allowedDomains: $allowedDomains }) {
      allowedDomains
    }
  }
`;
