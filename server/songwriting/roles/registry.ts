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
 * Lookup a role by its unique ID.
 */
export function getRoleById(roleId?: string): SongwriterRole | undefined {
  if (!roleId) return undefined;
  const normalized = roleId.trim().toLowerCase();
  return ROLE_REGISTRY[normalized];
}

/**
 * List all available registered songwriter roles.
 */
export function listAllRoles(): SongwriterRole[] {
  return Object.values(ROLE_REGISTRY);
}
