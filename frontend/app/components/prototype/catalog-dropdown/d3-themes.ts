export type D3TreeThemeKey = 'purple';

export type D3DropdownTheme = {
  label: string;
  sidebar: string;
  sidebarTitle: string;
  manufacturerActive: string;
  manufacturerIdle: string;
  manufacturerGoLink: string;
  catalogLink: string;
  toolbarBtn: string;
  treeTheme: D3TreeThemeKey;
};

/** D3P — approved header dropdown verdict (#72) */
export const D3P_DROPDOWN_THEME: D3DropdownTheme = {
  label: 'D3P — фиолетовый сайдбар + radio-бренды',
  sidebar: 'border-brand-purple-800 bg-brand-purple-950',
  sidebarTitle: 'text-white',
  manufacturerActive: 'font-semibold text-accent-500',
  manufacturerIdle: 'font-medium text-white hover:text-white/90',
  manufacturerGoLink: 'text-accent-500 hover:text-accent-400',
  catalogLink: 'text-accent-600 hover:underline',
  toolbarBtn: 'text-neutral-600 hover:bg-brand-purple-50',
  treeTheme: 'purple',
};

export type D3TreeTheme = {
  rowHover: string;
  chevron: string;
  iconWrap: string;
  link: string;
  folderOpen: string;
  folderClosed: string;
  leaf: string;
};

export const D3P_TREE_THEME: D3TreeTheme = {
  rowHover: 'hover:bg-brand-purple-50/60',
  chevron: 'text-brand-purple-400 hover:bg-brand-purple-100/80',
  iconWrap: 'bg-brand-purple-100 text-brand-purple-700',
  link: 'text-neutral-900 hover:text-brand-purple-700',
  folderOpen: 'i-lucide-folder-tree',
  folderClosed: 'i-lucide-folder',
  leaf: 'i-lucide-box',
};
