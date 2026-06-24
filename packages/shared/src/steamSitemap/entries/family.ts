import type { SitemapEntry } from '../types'

/** Steam Families / parental controls + account privacy & data. */
const FAMILY: SitemapEntry[] = [
  {
    id: 'familyManagement',
    title: 'Steam Families — Family Management',
    url: 'https://store.steampowered.com/account/familymanagement',
    section: 'family',
    description:
      'Create/manage a Steam Family (up to 6 members), invite adults/children, and configure shared-library + parental settings. The modern Steam Families page, superseding legacy Family Sharing. Use for "family sharing" / "share my games" / "add a child account".',
    keywords: ['steam families', 'family sharing', 'family management', 'add child account', 'share my games', 'create a family'],
    functionalities: ['configure', 'create', 'invite', 'manage'],
    needsAuth: true,
  },
  {
    id: 'steamFamiliesGuide',
    title: 'Steam Families Guide & FAQ',
    url: 'https://help.steampowered.com/en/faqs/view/054C-3167-DD7F-49D4',
    section: 'help',
    description:
      'Explains roles, library-sharing rules, parental controls, and migration from legacy Family Sharing. Use for "how does family sharing work".',
    keywords: ['steam families guide', 'how does family sharing work', 'family faq', 'child account rules'],
    functionalities: ['learn'],
    needsAuth: false,
  },
  {
    id: 'parentalControls',
    title: 'Parental Controls',
    url: 'https://store.steampowered.com/parental/',
    section: 'family',
    description:
      'Per-child controls: store access, chat/community, screen time, content filters, and purchase approvals. Use for "parental controls" / "restrict games" / "kids account" / "screen time".',
    keywords: ['parental controls', 'family view', 'screen time', 'kids account', 'restrict games', 'child restrictions'],
    functionalities: ['configure', 'restrict'],
    needsAuth: true,
  },
  {
    id: 'accountData',
    title: 'Account Data & Privacy Dashboard',
    url: 'https://help.steampowered.com/en/accountdata',
    section: 'privacy',
    description:
      'GDPR privacy dashboard: view your personal-data categories and download your data. Use for "download my data" / "data request" / "export my data".',
    keywords: ['download my data', 'my account data', 'gdpr', 'data request', 'personal data', 'export my data', 'privacy dashboard'],
    functionalities: ['view', 'download', 'request'],
    needsAuth: true,
  },
  {
    id: 'deleteAccount',
    title: 'Delete Account',
    url: 'https://help.steampowered.com/en/faqs/view/21A6-7C93-6CFE-100B',
    section: 'privacy',
    description:
      'How to permanently delete a Steam account and the consequences (initiated from the account-data dashboard). Use for "delete my account" / "close account".',
    keywords: ['delete account', 'close account', 'remove my account', 'permanently delete', 'delete steam'],
    functionalities: ['delete', 'request'],
    needsAuth: false,
  },
  {
    id: 'cookiePreferences',
    title: 'Cookie Preferences',
    url: 'https://store.steampowered.com/account/cookiepreferences/',
    section: 'privacy',
    description:
      'Manage cookie/tracking consent for Steam sites. Use for "cookies" / "tracking consent".',
    keywords: ['cookies', 'cookie preferences', 'tracking consent', 'manage cookies'],
    functionalities: ['configure'],
    needsAuth: false,
  },
  {
    id: 'familyTroubleHelp',
    title: 'Help — Steam Family Problems',
    url: 'https://help.steampowered.com/en/wizard/HelpWithSteamIssue/?issueid=816',
    section: 'help',
    description:
      'Support wizard for Steam Family problems (joining/leaving, sharing limits, purchase-request approvals, the switch-family cooldown). Use for "can\'t join my family" / "family sharing not working".',
    keywords: ['family problem', "can't join family", 'family sharing not working', 'family cooldown', 'kicked from family'],
    functionalities: ['troubleshoot'],
    needsAuth: true,
  },
  {
    id: 'familyViewHelp',
    title: 'Help — Family View / Parental Controls',
    url: 'https://help.steampowered.com/en/faqs/view/6B1A-66BE-E911-3D98',
    section: 'help',
    description:
      'How to enable Family View, set/recover the PIN, and restrict store/library/community access. Use for "family view" / "lost my family PIN" / "parental controls help".',
    keywords: ['family view', 'family pin', 'lost family view pin', 'parental controls help', 'restrict access'],
    functionalities: ['learn', 'configure'],
    needsAuth: true,
  },
]

export { FAMILY }
