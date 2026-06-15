// Editorial content + curated Unsplash imagery for the storefront.
// All URLs use the Unsplash CDN with explicit sizing; any that 404 fall back
// to the on-brand gradient via <SmartImage>.

const U = (id: string, w = 1400) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const HERO_IMAGE = U('1571019613454-1cb2f99b2d8b', 1600); // woman stretching, calm light

export interface HowStep {
  n: string;
  title: string;
  body: string;
}

export const HOW_STEPS: HowStep[] = [
  {
    n: '01',
    title: 'Apply in seconds',
    body: 'A coin-sized sensor goes on your arm — no fingersticks, no fuss. You barely feel it.',
  },
  {
    n: '02',
    title: 'Live your life',
    body: 'Shower, sleep, train. It streams continuous readings to your phone, 24/7, for 15 days.',
  },
  {
    n: '03',
    title: 'Act on what you see',
    body: 'Lumora turns raw signals into plain-language guidance — so you know what to change today.',
  },
];

export interface Feature {
  stat: string;
  label: string;
  body: string;
  image: string;
}

export const FEATURE_BANDS: Feature[] = [
  {
    stat: '15-day',
    label: 'Wear it and forget it',
    body: 'One sensor lasts two full weeks. Waterproof to 1m, so it stays on through every shower, swim, and sweat session.',
    image: U('1538805060514-97d9cc17730c', 1200), // person outdoors active
  },
  {
    stat: '93%',
    label: 'Clinical-grade accuracy',
    body: 'Built on the science that pioneered continuous monitoring. The clarity of a lab, on your arm, in real time.',
    image: U('1576091160399-112ba8d25d1d', 1200), // healthcare / data
  },
];

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  image: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'Being able to see how a meal, a walk, or a bad night of sleep moves the needle is a total game changer. I finally understand my own body.',
    name: 'Rex S.',
    role: 'Member since 2024',
    image: U('1500648767791-00dcc994a43e', 400),
  },
  {
    quote:
      'No fingersticks, no guesswork. I put it on, forgot about it, and two weeks later I had insights my doctor was impressed by.',
    name: 'Felix M.',
    role: 'Member since 2025',
    image: U('1494790108377-be9c29b29330', 400),
  },
  {
    quote:
      'The app makes the data feel calm instead of overwhelming. It tells me what matters and skips the noise.',
    name: 'Amara T.',
    role: 'Member since 2024',
    image: U('1438761681033-6461ffad8d80', 400),
  },
];

export interface TrustItem {
  title: string;
  body: string;
}

export const TRUST_ITEMS: TrustItem[] = [
  { title: 'Free 2-day shipping', body: 'On every order, always.' },
  { title: 'Cancel anytime', body: 'No contracts, no fees, no hassle.' },
  { title: '15-day guarantee', body: 'Sensor not sticking? We ship a new one, on us.' },
  { title: 'FSA / HSA eligible', body: 'Use pre-tax dollars at checkout.' },
];
