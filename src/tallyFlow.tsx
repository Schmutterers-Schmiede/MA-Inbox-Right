export const PROTOTYPE_URLS: Record<string, string> = {
  amazon_nav_baseline: 'https://schmutterers-schmiede.github.io/MA-AmazonMockup-Right/',
  amazon_nav_variant:  'https://schmutterers-schmiede.github.io/MA-AmazonMockup-Left/',
  settings_baseline:   'https://schmutterers-schmiede.github.io/MA-MobileSettingsMenu-Right/',
  settings_variant:    'https://schmutterers-schmiede.github.io/MA-MobileSettingsMenu-Left/',
  control_center_baseline: 'https://schmutterers-schmiede.github.io/MA-iosControlCenter-Right/',
  control_center_variant:  'https://schmutterers-schmiede.github.io/MA-iosControlCenter-Left/',
  message_inbox_baseline: 'https://schmutterers-schmiede.github.io/MA-Inbox-Right/',
  message_inbox_variant:  'https://schmutterers-schmiede.github.io/MA-Inbox-Left/', // TODO: confirm once the left-handed repo exists
};

export const INSTRUCTIONS: Record<string, { title: string; text: string }> = {
  control_center: {
    title: "Control Center",
    text: "Try opening the control panel and toggling one setting. When you're done, tap 'Rate this' below.",
  },
  settings: {
    title: "Settings Menu",
    text: "Try toggling 'Wi-Fi' at the top, then scroll down and toggle 'Developer options' near the bottom. When you're done, tap 'Rate this' below.",
  },
  amazon_nav: {
    title: "App Navigation",
    text: "Try opening the Rufus tab using the navigation bar. When you're done, tap 'Rate this' below.",
  },
  message_inbox: {
    title: "Inbox",
    text: "Try deleting any 3 messages by swiping them. When you're done, tap 'Rate this' below.",
  },
};

export function getContext() {
  const params = new URLSearchParams(window.location.search);
  const pid = params.get('pid') ?? '';
  const order = (params.get('order') ?? '').split(',');
  const step = parseInt(params.get('step') ?? '0', 10);
  const grip = params.get('grip') ?? '';
  const pairIndex = Math.floor(step / 2);
  const isVariant = step % 2 === 1;
  const pair = order[pairIndex];
  return { pid, order, step, grip, pair, isVariant };
}

export function nextUrl(ctx: ReturnType<typeof getContext>) {
  const nextStep = ctx.step + 1;
  if (nextStep >= 8) return `https://tally.so/r/gD17jO?pid=${ctx.pid}&grip=${ctx.grip}`;
  const nextPairIndex = Math.floor(nextStep / 2);
  const nextIsVariant = nextStep % 2 === 1;
  const nextPair = ctx.order[nextPairIndex];
  const key = `${nextPair}_${nextIsVariant ? 'variant' : 'baseline'}`;
  const base = PROTOTYPE_URLS[key];
  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}pid=${ctx.pid}&order=${ctx.order.join(',')}&step=${nextStep}&grip=${ctx.grip}`;
}