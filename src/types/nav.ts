export type INavItem = {
  label: string;
  icon: React.ReactNode;
  page: string;
};

export type INavGroup = {
  label: string;
  icon: React.ReactNode;
  items: INavItem[];
};

export type INavEntry = INavItem | INavGroup;

export function isNavGroup(entry: INavEntry): entry is INavGroup {
  return 'items' in entry;
}
