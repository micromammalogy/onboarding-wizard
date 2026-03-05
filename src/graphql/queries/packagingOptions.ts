export const PACKAGING_OPTIONS_QUERY = `
  query getPackagingOptions {
    packagingOptions(filter: { status: ENABLED }) {
      id
      name
      length
      width
      height
      dimensionalUnit
      packageWeight
      weightCapacity
      weightUnit
      type
      source
      status
      createdAt
    }
  }
`;

export type IPackagingOption = {
  id: string;
  name: string | null;
  length: string;
  width: string;
  height: string;
  dimensionalUnit: IDimensionalUnitCode;
  packageWeight: string;
  weightCapacity: string;
  weightUnit: IWeightUnitCode;
  type: IPackagingType;
  source: IPackagingOptionSource;
  status: 'ENABLED' | 'DISABLED';
  createdAt: string;
};

export type IPackagingOptionsData = {
  packagingOptions: IPackagingOption[];
};

export type IDimensionalUnitCode = 'CENTIMETER' | 'INCH' | 'METER' | 'MILLIMETER' | 'FOOT';
export type IWeightUnitCode = 'GRAM' | 'KILOGRAM' | 'OUNCE' | 'POUND';
export type IPackagingType =
  | 'ENVELOPE'
  | 'FLAT'
  | 'PACKAGE'
  | 'PAK'
  | 'PARCEL'
  | 'POLYBAG'
  | 'TUBE';
export type IPackagingOptionSource = 'ORGANIZATION' | 'DEFAULT' | 'DYNAMIC' | 'GENERAL' | 'SIMULATE';
