import { SongwriterRoleResolutionInput, ResolvedSongwriterRole, SongwriterRole } from './schema';
import { ROLE_REGISTRY, getRoleById } from './registry';
import { getLanguageProfile } from '../profiles';

/**
 * Resolves the appropriate SongwriterRole based on user input, genres, language, and cultural context.
 * Follows strict priority order:
 * 1. Explicit User Request
 * 2. Explicit Genre + Language Match
 * 3. Genre Family Match
 * 4. Generic Multilingual Fallback
 */
export function resolveSongwriterRole(input: SongwriterRoleResolutionInput): ResolvedSongwriterRole {
  const language = (input.language || 'ไทย').trim().toLowerCase();
  const isThai = language === 'th' || language === 'thai' || language === 'ภาษาไทย' || language === 'ไทย' || language.includes('thai') || language.includes('ไทย');
  const isEnglish = language === 'en' || language === 'english' || language === 'อังกฤษ' || language.includes('english') || language.includes('eng');

  const genres: string[] = Array.isArray(input.genre)
    ? input.genre
    : input.genre
    ? [input.genre]
    : [];
  const subgenres: string[] = Array.isArray(input.subGenre)
    ? input.subGenre
    : input.subGenre
    ? [input.subGenre]
    : [];
  const allGenreText = [...genres, ...subgenres].join(' ').toLowerCase();

  const langProfile = getLanguageProfile(input.language);
  const langProfileCode = langProfile.languageCode;

  // -------------------------------------------------------------
  // Priority 1: Explicit user-selected / requested role
  // -------------------------------------------------------------
  if (input.requestedRole) {
    const explicitRole = getRoleById(input.requestedRole);
    if (explicitRole) {
      console.log(`[RoleResolver] language="${input.language}", requestedRole="${input.requestedRole}", resolvedRole="${explicitRole.id}", source="EXPLICIT_USER"`);
      return {
        role: explicitRole,
        languageProfileCode: langProfileCode,
        resolutionSource: 'EXPLICIT_USER',
        matchReason: `User explicitly requested role: "${input.requestedRole}" (${explicitRole.name})`,
      };
    }
  }

  // -------------------------------------------------------------
  // Priority 2: Explicit Genre + Language Exact Match
  // -------------------------------------------------------------
  if (isThai) {
    // Thai Country Folk / Phleng Puea Chiwit / Luk Thung
    if (
      allGenreText.includes('ลูกทุ่ง') ||
      allGenreText.includes('เพื่อชีวิต') ||
      allGenreText.includes('country folk') ||
      allGenreText.includes('folk') ||
      allGenreText.includes('luk thung') ||
      allGenreText.includes('puea chiwit') ||
      allGenreText.includes('คันทรี') ||
      allGenreText.includes('หมอลำ')
    ) {
      const role = ROLE_REGISTRY['thai_country_folk'];
      console.log(`[RoleResolver] language="Thai", genre="${allGenreText}", resolvedRole="${role.id}", source="GENRE_LANGUAGE_MATCH"`);
      return {
        role,
        languageProfileCode: langProfileCode,
        resolutionSource: 'GENRE_LANGUAGE_MATCH',
        matchReason: 'Matched Thai language with Country Folk / Luk Thung / Phleng Puea Chiwit genre profile',
      };
    }

    // Thai R&B / Soul / Urban
    if (
      allGenreText.includes('r&b') ||
      allGenreText.includes('rnb') ||
      allGenreText.includes('soul') ||
      allGenreText.includes('neo-soul') ||
      allGenreText.includes('urban')
    ) {
      const role = ROLE_REGISTRY['thai_rnb_soul'];
      console.log(`[RoleResolver] language="Thai", genre="${allGenreText}", resolvedRole="${role.id}", source="GENRE_LANGUAGE_MATCH"`);
      return {
        role,
        languageProfileCode: langProfileCode,
        resolutionSource: 'GENRE_LANGUAGE_MATCH',
        matchReason: 'Matched Thai language with Contemporary R&B / Soul / Urban genre profile',
      };
    }

    // Thai Hip-Hop / Rap
    if (
      allGenreText.includes('hip-hop') ||
      allGenreText.includes('hiphop') ||
      allGenreText.includes('rap') ||
      allGenreText.includes('trap') ||
      allGenreText.includes('boom bap')
    ) {
      const role = ROLE_REGISTRY['thai_hiphop'];
      console.log(`[RoleResolver] language="Thai", genre="${allGenreText}", resolvedRole="${role.id}", source="GENRE_LANGUAGE_MATCH"`);
      return {
        role,
        languageProfileCode: langProfileCode,
        resolutionSource: 'GENRE_LANGUAGE_MATCH',
        matchReason: 'Matched Thai language with Hip-Hop / Rap / Urban Beat genre profile',
      };
    }
  }

  // -------------------------------------------------------------
  // Priority 3: Genre Family Match (Language-Adaptive Roles)
  // -------------------------------------------------------------
  // Film / TV Soundtrack
  if (
    allGenreText.includes('ost') ||
    allGenreText.includes('soundtrack') ||
    allGenreText.includes('cinematic') ||
    allGenreText.includes('film') ||
    allGenreText.includes('ละคร') ||
    allGenreText.includes('ภาพยนตร์') ||
    allGenreText.includes('ซีรีส์')
  ) {
    const role = ROLE_REGISTRY['film_tv_songwriter'];
    console.log(`[RoleResolver] language="${input.language}", genre="${allGenreText}", resolvedRole="${role.id}", source="GENRE_FAMILY_MATCH"`);
    return {
      role,
      languageProfileCode: langProfileCode,
      resolutionSource: 'GENRE_FAMILY_MATCH',
      matchReason: 'Matched Soundtrack / OST / Cinematic storytelling genre family',
    };
  }

  // Indie Pop / Bedroom Pop / Dream Pop / Alternative
  if (
    allGenreText.includes('indie') ||
    allGenreText.includes('bedroom pop') ||
    allGenreText.includes('dream pop') ||
    allGenreText.includes('alternative') ||
    allGenreText.includes('lo-fi') ||
    allGenreText.includes('acoustic pop') ||
    allGenreText.includes('อินดี้')
  ) {
    const role = ROLE_REGISTRY['indie_pop'];
    console.log(`[RoleResolver] language="${input.language}", genre="${allGenreText}", resolvedRole="${role.id}", source="GENRE_FAMILY_MATCH"`);
    return {
      role,
      languageProfileCode: langProfileCode,
      resolutionSource: 'GENRE_FAMILY_MATCH',
      matchReason: 'Matched Indie Pop / Bedroom Pop / Alternative genre family',
    };
  }

  // Commercial / Mainstream Pop
  if (
    allGenreText.includes('pop') ||
    allGenreText.includes('dance') ||
    allGenreText.includes('synth pop') ||
    allGenreText.includes('ป๊อป') ||
    allGenreText.includes('ฮิต') ||
    allGenreText.includes('mainstream')
  ) {
    const role = ROLE_REGISTRY['commercial_pop'];
    console.log(`[RoleResolver] language="${input.language}", genre="${allGenreText}", resolvedRole="${role.id}", source="GENRE_FAMILY_MATCH"`);
    return {
      role,
      languageProfileCode: langProfileCode,
      resolutionSource: 'GENRE_FAMILY_MATCH',
      matchReason: 'Matched Commercial Pop / Mainstream / Dance Pop genre family',
    };
  }

  // -------------------------------------------------------------
  // Priority 4: Generic Multilingual Fallback
  // -------------------------------------------------------------
  const fallbackRole = ROLE_REGISTRY['generic_multilingual'];
  console.log(`[RoleResolver] language="${input.language}", genre="${allGenreText}", resolvedRole="${fallbackRole.id}", source="GENERIC_FALLBACK"`);
  return {
    role: fallbackRole,
    languageProfileCode: langProfileCode,
    resolutionSource: 'GENERIC_FALLBACK',
    matchReason: `No specific genre-language role matched for "${allGenreText}" in "${input.language}". Operating in Generic Multilingual Songwriter mode.`,
  };
}
