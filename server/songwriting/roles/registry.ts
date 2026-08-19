import { SongwriterRole } from './schema';
import { thaiCountryFolkRole } from './profiles/thai-country-folk';
import { thaiRnbSoulRole } from './profiles/thai-rnb-soul';
import { thaiHiphopRole } from './profiles/thai-hiphop';
import { indiePopRole } from './profiles/indie-pop';
import { commercialPopRole } from './profiles/commercial-pop';
import { filmTvRole } from './profiles/film-tv';
import { genericMultilingualRole } from './profiles/generic';

export * from './schema';
export * from './profiles/thai-country-folk';
export * from './profiles/thai-rnb-soul';
export * from './profiles/thai-hiphop';
export * from './profiles/indie-pop';
export * from './profiles/commercial-pop';
export * from './profiles/film-tv';
export * from './profiles/generic';

export const ROLE_REGISTRY: Record<string, SongwriterRole> = {
  thai_country_folk: thaiCountryFolkRole,
  thai_rnb_soul: thaiRnbSoulRole,
  thai_hiphop: thaiHiphopRole,
  indie_pop: indiePopRole,
  commercial_pop: commercialPopRole,
  film_tv_songwriter: filmTvRole,
  generic_multilingual: genericMultilingualRole,
};

/**
 * Common ID Aliases for flexible role lookup
 */
const ROLE_ALIASES: Record<string, string> = {
  'thai-country-folk': 'thai_country_folk',
  'country-folk': 'thai_country_folk',
  'country_folk': 'thai_country_folk',
  'thai-rnb-soul': 'thai_rnb_soul',
  'rnb-soul': 'thai_rnb_soul',
  'rnb_soul': 'thai_rnb_soul',
  'thai-hiphop': 'thai_hiphop',
  'hiphop': 'thai_hiphop',
  'indie-pop': 'indie_pop',
  'commercial-pop': 'commercial_pop',
  'film-tv': 'film_tv_songwriter',
  'film_tv': 'film_tv_songwriter',
  'soundtrack': 'film_tv_songwriter',
  'generic': 'generic_multilingual',
  'multilingual': 'generic_multilingual',
};

/**
 * Lookup a role by its unique ID with alias support.
 */
export function getRoleById(roleId?: string): SongwriterRole | undefined {
  if (!roleId) return undefined;
  const normalized = roleId.trim().toLowerCase().replace(/-/g, '_');
  
  if (ROLE_REGISTRY[normalized]) {
    return ROLE_REGISTRY[normalized];
  }

  const rawKey = roleId.trim().toLowerCase();
  if (ROLE_ALIASES[rawKey] && ROLE_REGISTRY[ROLE_ALIASES[rawKey]]) {
    return ROLE_REGISTRY[ROLE_ALIASES[rawKey]];
  }

  return undefined;
}

/**
 * List all available registered songwriter roles.
 */
export function listAllRoles(): SongwriterRole[] {
  return Object.values(ROLE_REGISTRY);
}