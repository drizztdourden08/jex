import type { SitemapEntry } from '../types'

/** Account settings & security (mostly store-domain /account/ pages). */
const ACCOUNT: SitemapEntry[] = [
  {
    id: 'accountDetails',
    title: 'Account Details',
    url: 'https://store.steampowered.com/account/',
    section: 'account',
    description:
      'The account dashboard: account name, email, country, wallet, and links to security, transactions, licenses, and preferences. The general "my account" starting point; also where you change email and manage linked accounts.',
    keywords: ['account details', 'my account', 'account settings', 'account page', 'manage my account', 'change email', 'linked accounts'],
    functionalities: ['view', 'configure'],
    needsAuth: true,
  },
  {
    id: 'storePreferences',
    title: 'Store Content Preferences',
    url: 'https://store.steampowered.com/account/preferences',
    section: 'account',
    description:
      'Mature-content filtering, ignored/excluded tags, language and currency display. Use to change what the store shows or hides.',
    keywords: ['store preferences', 'my preferences', 'content preferences', 'hide tags', 'mature content filter', 'ignored tags', 'ignored games', 'show adult content'],
    functionalities: ['configure'],
    needsAuth: true,
  },
  {
    id: 'emailPreferences',
    title: 'Email / Notification Preferences',
    url: 'https://store.steampowered.com/account/notificationsettings',
    section: 'account',
    description:
      'Manage Steam notifications and which marketing/community/market emails Steam sends. Use for "stop emails" / "unsubscribe" / "notification settings".',
    keywords: ['email preferences', 'stop emails', 'unsubscribe', 'email notifications', 'notification settings', 'push notifications', 'wishlist notifications'],
    functionalities: ['configure', 'unsubscribe'],
    needsAuth: true,
  },
  {
    id: 'steamGuard',
    title: 'Steam Guard / Two-Factor Security',
    url: 'https://help.steampowered.com/en/faqs/view/06B0-26E6-2CF8-254C',
    section: 'security',
    description:
      'Explains and helps enable Steam Guard (email + mobile authenticator) — Steam\'s two-factor account security. Use for "secure my account" / "two-factor" / "2FA".',
    keywords: ['account security', 'steam guard', 'two factor', '2fa', 'secure my account', 'protect my account'],
    functionalities: ['configure', 'learn'],
    needsAuth: false,
  },
  {
    id: 'mobileAuthenticator',
    title: 'Steam Guard Mobile Authenticator',
    url: 'https://help.steampowered.com/en/faqs/view/7EFD-3CAE-64D3-1C31',
    section: 'security',
    description:
      'Set up, use, remove, or move the mobile authenticator in the Steam Mobile App. Use for "authenticator setup" / "moving to a new phone".',
    keywords: ['mobile authenticator', 'steam guard app', 'authenticator', 'new phone', 'transfer authenticator', 'remove authenticator'],
    functionalities: ['configure', 'setup', 'remove'],
    needsAuth: false,
  },
  {
    id: 'deauthorizeDevices',
    title: 'Manage / Deauthorize Devices',
    url: 'https://store.steampowered.com/twofactor/manage',
    section: 'security',
    description:
      'Manage Steam Guard and "Deauthorize all other devices". Use to sign out everywhere after a suspected compromise.',
    keywords: ['deauthorize devices', 'sign out of all devices', 'authorized devices', 'manage steam guard', 'log out everywhere', 'remembered devices'],
    functionalities: ['deauthorize', 'revoke', 'manage'],
    needsAuth: true,
  },
  {
    id: 'changePassword',
    title: 'Change / Reset Password',
    url: 'https://help.steampowered.com/en/wizard/HelpWithLoginInfo?issueid=406',
    section: 'security',
    description:
      'Change or reset the account password; forgot-password also routes through here. Use for "change my password" / "forgot my password".',
    keywords: ['change password', 'reset password', 'forgot password', 'new password', "can't log in", 'forgot my password'],
    functionalities: ['recover', 'reset', 'configure'],
    needsAuth: false,
  },
  {
    id: 'managePhone',
    title: 'Manage Phone Number',
    url: 'https://store.steampowered.com/phone/manage',
    section: 'security',
    description:
      'Add, change, or remove the phone number tied to the account. Use for "add/change/remove phone" / "verify phone".',
    keywords: ['phone number', 'add phone', 'change phone number', 'remove phone', 'verify phone'],
    functionalities: ['configure', 'add', 'remove'],
    needsAuth: true,
  },
  {
    id: 'purchaseHistory',
    title: 'Purchase History / Transactions',
    url: 'https://store.steampowered.com/account/history/',
    section: 'wallet',
    description:
      'All store transactions with view/print receipts. Use for "purchase history" / "find a receipt" / "what did I buy" / "check a charge".',
    keywords: ['purchase history', 'transactions', 'receipt', 'view receipt', 'what did i buy', 'billing history', 'print receipt'],
    functionalities: ['view', 'print', 'audit'],
    needsAuth: true,
  },
  {
    id: 'paymentMethods',
    title: 'Manage Payment Methods',
    url: 'https://store.steampowered.com/account/addnewcard',
    section: 'wallet',
    description:
      'Add, remove, or update stored payment methods (cards, PayPal). Use for "payment methods" / "add a card" / "remove my card".',
    keywords: ['payment methods', 'add card', 'remove card', 'credit card', 'paypal', 'update payment', 'stored cards'],
    functionalities: ['configure', 'add', 'remove'],
    needsAuth: true,
  },
  {
    id: 'apiKey',
    title: 'Steam Web API Key',
    url: 'https://steamcommunity.com/dev/apikey',
    section: 'account',
    description:
      'Register or view a personal Steam Web API key (on the community /dev page, NOT the store account pages). Use for "get an API key" / "developer key".',
    keywords: ['api key', 'web api key', 'steam api', 'developer key', 'register api key'],
    functionalities: ['register', 'view'],
    needsAuth: true,
  },
  {
    id: 'clientBeta',
    title: 'Steam Client Beta',
    url: 'https://help.steampowered.com/en/faqs/view/276C-85A0-C531-AFA3',
    section: 'account',
    description:
      'How to opt into/out of the Steam Client Beta (toggled in client Settings). Use for "client beta" / "early features" / "leave beta".',
    keywords: ['client beta', 'steam beta', 'opt into beta', 'beta participation', 'leave beta', 'early features'],
    functionalities: ['configure', 'opt-in'],
    needsAuth: false,
  },
  {
    id: 'accountLicenses',
    title: 'Licenses & Product Activations',
    url: 'https://store.steampowered.com/account/licenses/',
    section: 'account',
    description:
      'Every license/product on the account and how each was acquired (purchase, gift, key, free). Use for "my licenses" / "what do I own" / "product key activations".',
    keywords: ['my licenses', 'registered products', 'product key activations', 'what do i own', 'license list'],
    functionalities: ['view', 'audit'],
    needsAuth: true,
  },
  {
    id: 'steamReplay',
    title: 'Steam Replay (Year in Review)',
    url: 'https://store.steampowered.com/replay',
    section: 'account',
    description:
      'The annual personalized year-in-review: most-played games, total playtime, achievements, genres. Use for "year in review" / "my year on Steam" / "gaming recap". Seasonal (around December).',
    keywords: ['year in review', 'steam replay', 'my year on steam', 'gaming recap', 'wrapped', 'yearly stats'],
    functionalities: ['view'],
    needsAuth: true,
  },
  {
    id: 'steamMobileApp',
    title: 'Steam Mobile App',
    url: 'https://store.steampowered.com/mobile',
    section: 'account',
    description:
      'Download/info page for the Steam Mobile app (Steam Guard authenticator, QR sign-in, trade confirmations). Use for "Steam mobile app" / "authenticator app" / "QR sign in".',
    keywords: ['steam mobile app', 'download steam app', 'phone app', 'authenticator app', 'qr sign in'],
    functionalities: ['download', 'learn'],
    needsAuth: false,
  },
  {
    id: 'regionCurrency',
    title: 'Store Country / Currency',
    url: 'https://help.steampowered.com/en/faqs/view/3431-1342-D2D7-6F90',
    section: 'account',
    description:
      "How the account's store country and currency are determined and changed (tied to payment-method country). Use for \"change my region\" / \"change currency\" / \"wrong currency\".",
    keywords: ['change region', 'change currency', 'store country', 'wrong currency', 'change country', 'region locked'],
    functionalities: ['learn', 'configure'],
    needsAuth: true,
  },
]

export { ACCOUNT }
