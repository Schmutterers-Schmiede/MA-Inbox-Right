export const PAIRS = ['amazon_nav', 'settings', 'control_center', 'message_inbox'];

// Not every pair has all 3 variants — message_inbox has no one-handed-mode
// build, since shrink-and-dock doesn't meaningfully change a swipe gesture.
export const PAIR_VARIANTS: Record<string, string[]> = {
  amazon_nav:     ['baseline', 'lefthand', 'onehandmode'],
  settings:       ['baseline', 'lefthand', 'onehandmode'],
  control_center: ['baseline', 'lefthand', 'onehandmode'],
  message_inbox:  ['baseline', 'lefthand'],
};

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

interface SequenceStep {
  pair: string;
  variant: string;
}

function buildSequence(order: string[]): SequenceStep[] {
  const seq: SequenceStep[] = [];
  for (const pair of order) {
    const variants = PAIR_VARIANTS[pair] ?? [];
    for (const variant of variants) {
      seq.push({ pair, variant });
    }
  }
  return seq;
}

export function getContext() {
  const params = new URLSearchParams(window.location.search);
  const pid = params.get('pid') ?? '';
  const order = (params.get('order') ?? '').split(',');
  const step = parseInt(params.get('step') ?? '0', 10);
  const grip = params.get('grip') ?? '';

  const sequence = buildSequence(order);
  const current = sequence[step] ?? { pair: '', variant: 'baseline' };
  const pairVariants = PAIR_VARIANTS[current.pair] ?? [];
  const isLastVariant = pairVariants[pairVariants.length - 1] === current.variant;

  // A single, unambiguous value the form logic can check directly —
  // avoids relying on Tally correctly combining two separate conditions.
  let preferenceStep: 'skip' | 'two_way' | 'three_way';
  if (!isLastVariant) {
    preferenceStep = 'skip';
  } else if (pairVariants.length === 2) {
    preferenceStep = 'two_way';
  } else {
    preferenceStep = 'three_way';
  }

  return {
    pid,
    order,
    step,
    grip,
    pair: current.pair,
    variant: current.variant,
    preferenceStep, // 'skip' | 'two_way' | 'three_way' — tells the form exactly which page to show
  };
}

export function nextUrl(ctx: ReturnType<typeof getContext>) {
  const sequence = buildSequence(ctx.order);
  const nextStep = ctx.step + 1;

  if (nextStep >= sequence.length) {
    return `https://tally.so/r/gD17jO?pid=${ctx.pid}&grip=${ctx.grip}`;
  }

  const next = sequence[nextStep];
  const key = `${next.pair}_${next.variant}`;
  const base = PROTOTYPE_URLS[key];
  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}pid=${ctx.pid}&order=${ctx.order.join(',')}&step=${nextStep}&grip=${ctx.grip}`;
}