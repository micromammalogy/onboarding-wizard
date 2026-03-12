import { create } from 'zustand';
import { evaluateRules } from '@/lib/rules/evaluateRules';
import type {
  IResolvedConditionalRule,
  IFieldValueMap,
  IVisibilityMap,
  IHiddenByDefaultMap,
} from '@/lib/rules/types';

type IFieldValuesState = {
  /** field values keyed by widget_key */
  values: IFieldValueMap;
  /** visibility for tasks and widgets */
  visibility: IVisibilityMap;
  /** rules to evaluate */
  rules: IResolvedConditionalRule[];
  /** hidden by default flags */
  hiddenByDefault: IHiddenByDefaultMap;
  /** debounced save timer */
  _saveTimer: ReturnType<typeof setTimeout> | null;
  /** project id for API calls */
  _projectId: string | null;

  /** Initialize store with loaded data */
  init: (params: {
    projectId: string;
    fieldValues: Array<{ widget_key: string; task_id: string; value_text: string | null; value_select: string | null; value_date: string | null }>;
    rules: IResolvedConditionalRule[];
    hiddenByDefault: IHiddenByDefaultMap;
  }) => void;

  /** Get a field value */
  getValue: (widgetKey: string) => string | null;

  /** Set a field value (optimistic + debounced save) */
  setValue: (taskId: string, widgetKey: string, value: string | null) => void;

  /** Check if a task or widget is visible */
  isVisible: (id: string) => boolean;

  /** Reset store */
  reset: () => void;
};

const SAVE_DEBOUNCE_MS = 300;

export const useFieldValues = create<IFieldValuesState>((set, get) => ({
  values: new Map(),
  visibility: new Map(),
  rules: [],
  hiddenByDefault: new Map(),
  _saveTimer: null,
  _projectId: null,

  init: ({ projectId, fieldValues, rules, hiddenByDefault }) => {
    const values: IFieldValueMap = new Map();
    for (const fv of fieldValues) {
      const val = fv.value_select ?? fv.value_text ?? fv.value_date ?? null;
      values.set(fv.widget_key, val);
    }

    const visibility = evaluateRules(rules, values, hiddenByDefault);

    set({
      values,
      visibility,
      rules,
      hiddenByDefault,
      _projectId: projectId,
    });
  },

  getValue: (widgetKey: string) => {
    return get().values.get(widgetKey) ?? null;
  },

  setValue: (taskId: string, widgetKey: string, value: string | null) => {
    const state = get();
    const newValues = new Map(state.values);
    newValues.set(widgetKey, value);

    // Re-evaluate rules synchronously
    const newVisibility = evaluateRules(state.rules, newValues, state.hiddenByDefault);

    set({ values: newValues, visibility: newVisibility });

    // Debounced save to server
    if (state._saveTimer) {
      clearTimeout(state._saveTimer);
    }

    const timer = setTimeout(() => {
      const projectId = get()._projectId;
      if (!projectId) return;

      fetch(`/api/db/field-values/${taskId}/${encodeURIComponent(widgetKey)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          value_text: value,
          value_select: value,
        }),
      }).catch(err => {
        console.error('[useFieldValues] Save error:', err);
      });
    }, SAVE_DEBOUNCE_MS);

    set({ _saveTimer: timer });
  },

  isVisible: (id: string) => {
    const vis = get().visibility.get(id);
    // Default to visible if not in the map
    return vis ?? true;
  },

  reset: () => {
    const state = get();
    if (state._saveTimer) clearTimeout(state._saveTimer);
    set({
      values: new Map(),
      visibility: new Map(),
      rules: [],
      hiddenByDefault: new Map(),
      _saveTimer: null,
      _projectId: null,
    });
  },
}));
