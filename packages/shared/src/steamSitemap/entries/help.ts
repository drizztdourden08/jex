import type { SitemapEntry } from '../types'

/** Steam Support (help.steampowered.com) wizards + legal pages. */
const HELP: SitemapEntry[] = [
  {
    id: 'helpHome',
    title: 'Steam Support Home',
    url: 'https://help.steampowered.com/en/',
    section: 'help',
    description:
      'The support entry point: top categories + the user\'s recent purchases for contextual help. Use for a generic "I need help" / "contact support".',
    keywords: ['steam support', 'help', 'support home', 'contact help', 'i need help'],
    functionalities: ['navigate', 'learn'],
    needsAuth: false,
  },
  {
    id: 'helpWithLogin',
    title: "Help — Can't Sign In",
    url: 'https://help.steampowered.com/en/wizard/HelpWithLogin',
    section: 'help',
    description:
      'Login-trouble wizard: forgotten credentials, account recovery, Steam Guard code problems, lost authenticator. Use for "can\'t log in" / "not receiving my Steam Guard code".',
    keywords: ["can't sign in", "can't log in", 'login problem', 'forgot account name', 'not receiving steam guard code', 'lost authenticator'],
    functionalities: ['recover', 'troubleshoot'],
    needsAuth: false,
  },
  {
    id: 'requestRefund',
    title: 'Request a Refund / Purchase Help',
    url: 'https://help.steampowered.com/en/wizard/HelpWithPurchase',
    section: 'help',
    description:
      'Lists recent purchases and starts the refund / "problem with a purchase" flow. Use for "get a refund" / "refund a game" / "problem with a purchase".',
    keywords: ['request a refund', 'refund', 'problem with purchase', 'money back', 'wrong purchase', 'refund a game'],
    functionalities: ['request', 'refund', 'report'],
    needsAuth: true,
  },
  {
    id: 'refundPolicy',
    title: 'Refund Policy',
    url: 'https://store.steampowered.com/steam_refunds/',
    section: 'legal',
    description:
      'The canonical statement of Steam\'s refund policy and eligibility (14 days / under 2 hours guideline). Use for "refund rules" / "am I eligible for a refund".',
    keywords: ['refund policy', 'refund rules', 'am i eligible for a refund', 'how refunds work', 'two hour rule'],
    functionalities: ['learn'],
    needsAuth: false,
  },
  {
    id: 'unknownCharges',
    title: "Help — Charges I Didn't Make",
    url: 'https://help.steampowered.com/en/wizard/HelpWithUnknownCharges',
    section: 'help',
    description:
      'Wizard for unrecognized/unauthorized charges (compromise or a family purchase). Use for "unknown charge" / "unauthorized charge" / "fraud".',
    keywords: ['unknown charge', "didn't make this charge", 'unauthorized charge', 'fraud', 'unrecognized purchase'],
    functionalities: ['report', 'recover'],
    needsAuth: false,
  },
  {
    id: 'helpWithAccount',
    title: 'Help — My Account',
    url: 'https://help.steampowered.com/en/wizard/HelpWithAccount',
    section: 'help',
    description:
      'Account-issues wizard: email/password/phone changes, access, security, and account-data questions. Use for general "account problem" help.',
    keywords: ['account help', 'account issue', 'account problem', 'manage my account help', 'change account details'],
    functionalities: ['troubleshoot', 'configure'],
    needsAuth: false,
  },
  {
    id: 'accountStolen',
    title: 'Help — Account Stolen / Hijacked',
    url: 'https://help.steampowered.com/en/wizard/HelpWithAccountStolen',
    section: 'help',
    description:
      'Recovery wizard for a stolen/hijacked account. Use for "my account was hacked" / "someone took my account" / "compromised".',
    keywords: ['account stolen', 'hijacked', 'hacked account', 'recover my account', 'someone took my account', 'compromised'],
    functionalities: ['recover'],
    needsAuth: false,
  },
  {
    id: 'helpWithGame',
    title: 'Help — Missing Game / Game Problem',
    url: 'https://help.steampowered.com/en/wizard/HelpWithGame',
    section: 'help',
    description:
      'Per-game wizard for a missing game, install/launch issues, or a license problem. Use for "missing game" / "game won\'t launch" / "lost a game".',
    keywords: ['missing game', 'game disappeared', 'missing license', 'game not in library', "game won't launch", 'lost a game'],
    functionalities: ['troubleshoot', 'recover'],
    needsAuth: true,
  },
  {
    id: 'helpWithGifting',
    title: 'Help — Gifting',
    url: 'https://help.steampowered.com/en/wizard/HelpWithEconGifting',
    section: 'help',
    description:
      'Gifting wizard: gift history, resend/accept, extra copies, and gift problems. Use for "gift didn\'t arrive" / "resend a gift".',
    keywords: ['gift problem', "gift didn't arrive", 'resend gift', 'gifting help', 'gift history'],
    functionalities: ['troubleshoot', 'report'],
    needsAuth: true,
  },
  {
    id: 'contactSupport',
    title: 'How to Contact Steam Support',
    url: 'https://help.steampowered.com/en/faqs/view/6F69-0324-B2DB-6E7E',
    section: 'help',
    description:
      'Explains that support is reached by drilling through the relevant wizard to a ticket form (no general email/phone). Use for "talk to a human" / "open a ticket".',
    keywords: ['contact steam support', 'talk to support', 'open a ticket', 'email steam', 'reach support', 'human'],
    functionalities: ['contact', 'request'],
    needsAuth: false,
  },
  {
    id: 'subscriberAgreement',
    title: 'Steam Subscriber Agreement',
    url: 'https://store.steampowered.com/subscriber_agreement/',
    section: 'legal',
    description:
      'The SSA — the terms of service governing use of Steam. Use for "terms of service" / "TOS" / "user agreement".',
    keywords: ['subscriber agreement', 'terms of service', 'tos', 'ssa', 'legal terms', 'user agreement'],
    functionalities: ['learn'],
    needsAuth: false,
  },
  {
    id: 'privacyPolicy',
    title: 'Steam Privacy Policy',
    url: 'https://store.steampowered.com/privacy_agreement/',
    section: 'legal',
    description:
      'The full privacy policy (incl. account deletion and data handling). Use for "privacy policy" / "how Steam uses my data".',
    keywords: ['privacy policy', 'data privacy', 'how steam uses my data', 'privacy agreement'],
    functionalities: ['learn'],
    needsAuth: false,
  },
  {
    id: 'lostAuthenticator',
    title: 'Help — Lost Steam Guard / Authenticator',
    url: 'https://help.steampowered.com/en/wizard/HelpWithLoginInfo?lost=8&issueid=402',
    section: 'security',
    description:
      'Recovery wizard for a lost/deleted Steam Guard Mobile Authenticator (remove it, use a recovery code, regain access). Use for "lost my authenticator" / "new phone, no Steam Guard".',
    keywords: ['lost authenticator', 'lost steam guard', 'remove authenticator', 'recovery code', 'new phone steam guard'],
    functionalities: ['recover'],
    needsAuth: false,
  },
  {
    id: 'helpWithMarket',
    title: 'Help — Community Market',
    url: 'https://help.steampowered.com/en/wizard/HelpWithEconMarket',
    section: 'help',
    description:
      'Support wizard for Community Market problems (failed listings/purchases, market holds, eligibility). Use for "can\'t sell on the market" / "market hold".',
    keywords: ['market problem', "can't sell on market", 'market hold', 'market restriction', 'market purchase failed'],
    functionalities: ['troubleshoot', 'report'],
    needsAuth: true,
  },
  {
    id: 'helpWithTrade',
    title: 'Help — Trading / Trade Holds',
    url: 'https://help.steampowered.com/en/faqs/view/34A1-EA3F-83ED-54AB',
    section: 'help',
    description:
      'Explains trade/market holds, trade restrictions, and how the mobile authenticator removes them. Use for "trade hold" / "can\'t trade" / "escrow".',
    keywords: ['trade hold', 'trade ban', "can't trade", 'trade restriction', 'escrow'],
    functionalities: ['troubleshoot', 'learn'],
    needsAuth: true,
  },
  {
    id: 'helpWithVacBan',
    title: 'Help — VAC Ban',
    url: 'https://help.steampowered.com/en/faqs/view/647C-5CC1-7EA9-3C29',
    section: 'help',
    description:
      'Explains VAC (Valve Anti-Cheat) bans — permanent, non-negotiable, and which titles they affect. Use for "VAC ban" / "banned for cheating".',
    keywords: ['vac ban', 'anti-cheat ban', 'banned for cheating', 'vac banned', 'valve anti cheat'],
    functionalities: ['learn'],
    needsAuth: false,
  },
  {
    id: 'helpWithGameBan',
    title: 'Help — Game Ban (by Developer)',
    url: 'https://help.steampowered.com/en/faqs/view/46DB-4CEC-F7E9-49E5',
    section: 'help',
    description:
      "A Game Ban issued by a game's developer (distinct from VAC) — the developer, not Valve, administers and appeals it. Use for \"game ban\" / \"banned by the developer\".",
    keywords: ['game ban', 'banned by developer', 'developer ban', 'appeal game ban'],
    functionalities: ['learn'],
    needsAuth: false,
  },
]

export { HELP }
