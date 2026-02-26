/** Fulfillment center location (nested under party) */
export type ILocation = {
  line1: string | null;
  line2: string | null;
  line3: string | null;
  locality: string | null;
  administrativeArea: string | null;
  administrativeAreaCode: string | null;
  countryCode: string;
  postalCode: string | null;
};

/** Fulfillment center person/contact (nested under party) */
export type IPerson = {
  firstName: string | null;
  lastName: string | null;
  companyName: string | null;
  email: string | null;
  phone: string | null;
};

/** Party — the address+contact wrapper used by fulfillment centers */
export type IParty = {
  id: string;
  location: ILocation | null;
  person: IPerson | null;
};

export type IFulfillmentCenterType = 'PRIMARY' | 'STANDARD' | 'CONSOLIDATION_CENTER';

/** Fulfillment center as returned by the API */
export type IFulfillmentCenter = {
  id: string;
  name: string;
  type: IFulfillmentCenterType;
  party: IParty;
};

/** Cartonization box */
export type ICartonBox = {
  id: string;
  name: string;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  maxWeightKg: number;
};

/** Shipping rule (custom code or flat rate) */
export type IShippingRule = {
  id: string;
  name: string;
  type: 'CUSTOM_CODE' | 'FLAT_RATE';
  value?: string;
  enabled: boolean;
};

/** Generic key-value setting */
export type IOrgSetting = {
  key: string;
  value: string;
};
