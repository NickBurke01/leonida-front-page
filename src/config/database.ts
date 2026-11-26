/** Labels and options for the GTA 6 database (vehicles, weapons, characters, missions). */

export const VEHICLE_CLASSES = {
  super: 'Super',
  sports: 'Sports',
  'sports-classics': 'Sports Classics',
  muscle: 'Muscle',
  coupes: 'Coupes',
  sedans: 'Sedans',
  suvs: 'SUVs',
  'off-road': 'Off-Road',
  motorcycles: 'Motorcycles',
  compacts: 'Compacts',
  'vans-trucks': 'Vans & Trucks',
  emergency: 'Emergency',
  boats: 'Boats',
  aircraft: 'Aircraft',
} as const;
export type VehicleClass = keyof typeof VEHICLE_CLASSES;
export const VEHICLE_CLASS_KEYS = Object.keys(VEHICLE_CLASSES) as [VehicleClass, ...VehicleClass[]];

export const WEAPON_CATEGORIES = {
  pistols: 'Pistols',
  smgs: 'SMGs',
  'assault-rifles': 'Assault Rifles',
  shotguns: 'Shotguns',
  'sniper-rifles': 'Sniper Rifles',
  lmgs: 'LMGs',
  heavy: 'Heavy',
  melee: 'Melee',
  throwables: 'Throwables',
} as const;
export type WeaponCategory = keyof typeof WEAPON_CATEGORIES;
export const WEAPON_CATEGORY_KEYS = Object.keys(WEAPON_CATEGORIES) as [WeaponCategory, ...WeaponCategory[]];

export const TIERS = ['S', 'A', 'B', 'C', 'D'] as const;
export type Tier = (typeof TIERS)[number];
export const TIER_NOTES: Record<Tier, string> = {
  S: 'The best in the game right now',
  A: 'Excellent, worth owning',
  B: 'Solid, situational picks',
  C: 'Fine, but outclassed',
  D: 'Skip unless you love it',
};

/** Where a fact comes from. There is deliberately no "leak" option. */
export const CONFIRMED = {
  game: 'Confirmed in game',
  rockstar: 'Confirmed by Rockstar',
  trailer: 'Seen in a Rockstar trailer',
  'not-confirmed': 'Not confirmed yet',
} as const;
export type Confirmed = keyof typeof CONFIRMED;
export const CONFIRMED_KEYS = Object.keys(CONFIRMED) as [Confirmed, ...Confirmed[]];

export const VEHICLE_STATS = { speed: 'Speed', acceleration: 'Acceleration', braking: 'Braking', handling: 'Handling' } as const;
export const WEAPON_STATS = { damage: 'Damage', fireRate: 'Fire rate', range: 'Range', accuracy: 'Accuracy' } as const;
