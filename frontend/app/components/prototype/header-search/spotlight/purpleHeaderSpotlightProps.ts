/** Shared purple-header shell — variant B (#68 verdict direction) */
export const PURPLE_HEADER_SPOTLIGHT_PROPS = {
  overlayClass: 'bg-neutral-950/60 backdrop-blur-sm',
  panelClass: 'overflow-hidden rounded-lg bg-brand-purple-950 shadow-2xl',
  inputBarClass: 'border-b border-brand-purple-800 bg-brand-purple-950',
  inputClass: 'text-white placeholder:text-brand-purple-300',
  iconClass: 'text-white',
  kbdClass:
    'border border-brand-purple-700 bg-brand-purple-900 text-brand-purple-200',
  closeBtnClass:
    'text-brand-purple-200 hover:bg-brand-purple-900 hover:text-white',
  footerClass: 'border-t border-neutral-200 bg-neutral-50',
  footerTextClass: 'text-neutral-600',
  footerLinkClass:
    'font-medium text-brand-purple-900 underline decoration-brand-purple-200 underline-offset-2 hover:decoration-brand-purple-400',
  loadingClass: 'text-neutral-500',
  bodyClass: 'bg-white',
} as const;
