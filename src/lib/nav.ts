import { databaseAvailability } from './database';

export interface NavItem {
  href: string;
  label: string;
}

/** Main navigation. Database sections only appear once they have entries. */
export async function getNav() {
  const a = await databaseAvailability();
  const primary: NavItem[] = [
    { href: '/', label: 'Home' },
    ...(a.vehicles ? [{ href: '/vehicles/', label: 'Vehicles' }] : []),
    ...(a.weapons ? [{ href: '/weapons/', label: 'Weapons' }] : []),
    { href: '/guides/', label: 'Guides' },
    ...(a.tierLists ? [{ href: '/tier-lists/', label: 'Tier Lists' }] : []),
    { href: '/news/', label: 'News' },
  ];
  const more: NavItem[] = [
    ...(a.characters ? [{ href: '/characters/', label: 'Characters' }] : []),
    ...(a.missions ? [{ href: '/missions/', label: 'Missions' }] : []),
    ...(a.checklist ? [{ href: '/checklist/', label: '100% Checklist' }] : []),
    { href: '/channels/', label: 'Channels' },
    { href: '/about/', label: 'About' },
  ];
  return { primary, more, all: [...primary, ...more] };
}
