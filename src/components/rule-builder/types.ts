/**
 * Types for the visual rule builder.
 * Maps closely to the Zonos rules DSL and GraphQL API.
 */

// --- Condition types ---

export type IConditionOperator =
  | '=='
  | '!='
  | '>'
  | '<'
  | '>='
  | '<='
  | 'any_contains';

export type IConditionConnector = 'and' | 'or';

export type IRuleCondition = {
  id: string;
  variable: string;
  operator: IConditionOperator;
  value: string;
  connector: IConditionConnector;
};

// --- Action types ---

export type IActionOperation = 'set' | 'add' | 'subtract' | 'multiply';

export type IRuleAction = {
  id: string;
  variable: string;
  operation: IActionOperation;
  value: string;
  currency?: string;
};

// --- Structured rule (builder state) ---

export type IStructuredRule = {
  name: string;
  description: string;
  context: string;
  conditions: IRuleCondition[];
  actions: IRuleAction[];
  startsAt: string | null;
  endsAt: string | null;
};

// --- Token / variable types from API ---

export type IRuleTokenType =
  | 'MONEY'
  | 'STRING'
  | 'COUNTRY'
  | 'CURRENCY'
  | 'NUMBER'
  | 'BOOLEAN'
  | 'WEIGHT'
  | 'LENGTH'
  | 'VOLUME'
  | 'MONEY_LIST'
  | 'STRING_LIST'
  | 'COUNTRY_LIST'
  | 'CURRENCY_LIST'
  | 'NUMBER_LIST'
  | 'BOOLEAN_LIST'
  | 'WEIGHT_LIST'
  | 'LENGTH_LIST'
  | 'VOLUME_LIST';

export type IRuleToken = {
  value: string;
  description: string;
  ruleTokenType: string;
  assignable: boolean;
};

export type IRuleContext = {
  name: string;
  context: string;
  service: string;
  variables: IRuleToken[];
};

// --- API response types ---

export type IRuleFromAPI = {
  id: string;
  name: string;
  description: string;
  context: string;
  condition: string;
  actions: string[];
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type IRuleContextsData = {
  ruleContexts: IRuleContext[];
};

export type IRulesData = {
  rules: {
    edges: { node: IRuleFromAPI }[];
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
    totalCount: number;
  };
};

export type IRuleCreateData = {
  ruleCreate: IRuleFromAPI;
};

export type IRuleUpdateData = {
  ruleUpdate: IRuleFromAPI;
};

export type IRuleValidateData = {
  ruleValidate: 'SUCCESS' | 'FAILURE';
};

export type IRuleArchiveData = {
  ruleArchive: 'SUCCESS' | 'FAILURE';
};

// --- Operator/type mapping ---

export const OPERATORS_BY_TYPE: Record<string, IConditionOperator[]> = {
  STRING: ['==', '!=', 'any_contains'],
  NUMBER: ['==', '!=', '>', '<', '>=', '<='],
  MONEY: ['==', '!=', '>', '<', '>=', '<='],
  WEIGHT: ['==', '!=', '>', '<', '>=', '<='],
  LENGTH: ['==', '!=', '>', '<', '>=', '<='],
  VOLUME: ['==', '!=', '>', '<', '>=', '<='],
  COUNTRY: ['==', '!=', 'any_contains'],
  CURRENCY: ['==', '!=', 'any_contains'],
  BOOLEAN: ['==', '!='],
  STRING_LIST: ['any_contains'],
  NUMBER_LIST: ['any_contains'],
  MONEY_LIST: ['any_contains'],
  COUNTRY_LIST: ['any_contains'],
  CURRENCY_LIST: ['any_contains'],
  BOOLEAN_LIST: ['any_contains'],
  WEIGHT_LIST: ['any_contains'],
  LENGTH_LIST: ['any_contains'],
  VOLUME_LIST: ['any_contains'],
};

export const OPERATOR_LABELS: Record<IConditionOperator, string> = {
  '==': 'equals',
  '!=': 'not equals',
  '>': 'greater than',
  '<': 'less than',
  '>=': 'at least',
  '<=': 'at most',
  any_contains: 'contains',
};

export const ACTION_OPERATION_LABELS: Record<IActionOperation, string> = {
  set: 'set to',
  add: 'increase by',
  subtract: 'decrease by',
  multiply: 'multiply by',
};

export const OPERATIONS_BY_TYPE: Record<string, IActionOperation[]> = {
  STRING: ['set'],
  COUNTRY: ['set'],
  CURRENCY: ['set'],
  BOOLEAN: ['set'],
  NUMBER: ['set', 'add', 'subtract', 'multiply'],
  MONEY: ['set', 'add', 'subtract', 'multiply'],
  WEIGHT: ['set', 'add', 'subtract', 'multiply'],
  LENGTH: ['set', 'add', 'subtract', 'multiply'],
  VOLUME: ['set', 'add', 'subtract', 'multiply'],
  STRING_LIST: ['set'],
  COUNTRY_LIST: ['set'],
  CURRENCY_LIST: ['set'],
  BOOLEAN_LIST: ['set'],
  NUMBER_LIST: ['set'],
  MONEY_LIST: ['set'],
  WEIGHT_LIST: ['set'],
  LENGTH_LIST: ['set'],
  VOLUME_LIST: ['set'],
};

export const CONTEXT_LABELS: Record<string, string> = {
  ITEM_CREATE_POST: 'Item Modification',
  LANDED_COST_CALCULATE_POST: 'Landed Cost Adjustment',
  LANDED_COST_CARRIER_FEE: 'Carrier Fee',
  LANDED_COST_BILLING_FEE: 'Billing Fee',
  SHIPMENT_RATING_BUFFER: 'Shipping Rate Buffer',
  TAX_ADJUSTMENTS: 'Tax Adjustment',
  DISCOUNT_CONTEXT: 'Cart Discount',
  DISCOUNT_ITEM_CONTEXT: 'Item Discount',
  SHIPMENT_AUTOMATION: 'Shipment Automation',
};

// --- Helpers ---

export function createEmptyCondition(): IRuleCondition {
  return {
    id: crypto.randomUUID(),
    variable: '',
    operator: '==',
    value: '',
    connector: 'and',
  };
}

export function createEmptyAction(): IRuleAction {
  return {
    id: crypto.randomUUID(),
    variable: '',
    operation: 'set',
    value: '',
  };
}

export function createEmptyRule(): IStructuredRule {
  return {
    name: '',
    description: '',
    context: '',
    conditions: [createEmptyCondition()],
    actions: [createEmptyAction()],
    startsAt: null,
    endsAt: null,
  };
}
