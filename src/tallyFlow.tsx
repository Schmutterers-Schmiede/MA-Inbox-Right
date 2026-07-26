export const PAIRS = ['amazon_nav', 'settings', 'control_center', 'message_inbox'];
export const VARIANTS = ['baseline', 'lefthand', 'onehandmode'] as const;
export type Variant = typeof VARIANTS[number];

export const PROTOTYPE_URLS: Record<string, string> = {
  amazon_nav_baseline:    'https://schmutterers-schmiede.github.io/MA-AmazonMockup-Right/',
  amazon_nav_lefthand:    'https://schmutterers-schmiede.github.io/MA-AmazonMockup-Left/',
  amazon_nav_onehandmode: 'https://schmutterers-schmiede.github.io/MA-AmazonMockup-Scaled/',

  settings_baseline:    'https://schmutterers-schmiede.github.io/MA-MobileSettingsMenu-Right/',
  settings_lefthand:    'https://schmutterers-schmiede.github.io/MA-MobileSettingsMenu-Left/',
  settings_onehandmode: 'https://schmutterers-schmiede.github.io/MA-MobileSettingsMenu-OneHanded/',

  control_center_baseline:    'https://schmutterers-schmiede.github.io/MA-iosControlCenter-Right/',
  control_center_lefthand:    'https://schmutterers-schmiede.github.io/MA-iosControlCenter-Left/',
  control_center_onehandmode: 'https://schmutterers-schmiede.github.io/MA-iosControlCenter-OneHanded/',

  message_inbox_baseline:    'https://schmutterers-schmiede.github.io/MA-Inbox-Right/',
  message_inbox_lefthand:    'https://schmutterers-schmiede.github.io/MA-Inbox-Left/',
  message_inbox_onehandmode: 'https://schmutterers-schmiede.github.io/MA-Inbox-OneHanded/',
};

export const INSTRUCTIONS: Record<string, { title: string; text: string }> = {
  control_center: {
    title: "Control Center",
    text: "Try opening the control panel 3 separate times, closing it after each one. When you're done, tap 'Rate this' below.",
  },
  settings: {
    title: "Settings Menu",
    text: "Try toggling every setting on this screen at least once. When you're done, tap 'Rate this' below.",
  },
  amazon_nav: {
    title: "App Navigation",
    text: "Try visiting every tab in the navigation bar at least once. When you're done, tap 'Rate this' below.",
  },
  message_inbox: {
    title: "Inbox",
    text: "Try deleting every message by swiping them. When you're done, tap 'Rate this' below.",
  },
};

export function getContext() {
  const params = new URLSearchParams(window.location.search);
  const pid = params.get('pid') ?? '';
  const order = (params.get('order') ?? '').split(',');
  const step = parseInt(params.get('step') ?? '0', 10);
  const grip = params.get('grip') ?? '';

  const pairIndex = Math.floor(step / VARIANTS.length);
  const variantIndex = step % VARIANTS.length;
  const pair = order[pairIndex];
  const variant: Variant = VARIANTS[variantIndex];

  // Every pair now has exactly 3 variants, so "last variant" is always
  // onehandmode — the preference question is only ever a single 3-way ask.
  const isLastVariant = variantIndex === VARIANTS.length - 1;
  const preferenceStep: 'skip' | 'ask' = isLastVariant ? 'ask' : 'skip';

  return { pid, order, step, grip, pair, variant, preferenceStep };
}

export function nextUrl(ctx: ReturnType<typeof getContext>) {
  const totalSteps = PAIRS.length * VARIANTS.length; // 12
  const nextStep = ctx.step + 1;
  if (nextStep >= totalSteps) {
    return `https://tally.so/r/gD17jO?pid=${ctx.pid}&grip=${ctx.grip}`;
  }

  const nextPairIndex = Math.floor(nextStep / VARIANTS.length);
  const nextVariantIndex = nextStep % VARIANTS.length;
  const nextPair = ctx.order[nextPairIndex];
  const nextVariant = VARIANTS[nextVariantIndex];

  const key = `${nextPair}_${nextVariant}`;
  const base = PROTOTYPE_URLS[key];
  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}pid=${ctx.pid}&order=${ctx.order.join(',')}&step=${nextStep}&grip=${ctx.grip}`;
}