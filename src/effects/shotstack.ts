export const ShotstackEffects = {
  zoomIn: 'zoomIn',
  zoomOut: 'zoomOut',
  slideLeft: 'slideLeft',
  slideRight: 'slideRight',
  slideUp: 'slideUp',
  slideDown: 'slideDown'
} as const;

export const ShotstackTransitions = {
  fade: 'fade',
  wipeLeft: 'wipeLeft',
  wipeRight: 'wipeRight',
  carouselLeft: 'carouselLeft',
  carouselRight: 'carouselRight'
} as const;

export const ShotstackFilters = {
  greyscale: 'greyscale',
  sepia: 'sepia',
  vintage: 'vintage',
  negative: 'negative',
  muted: 'muted',
  darken: 'darken',
  lighten: 'lighten',
  blur: 'blur'
} as const;
