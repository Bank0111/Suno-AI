import { SongwriterRoleResolutionInput, ResolvedSongwriterRole, SongwriterRole } from './schema';
import { ROLE_REGISTRY, getRoleById } from './registry';
import { getLanguageProfile } from '../profiles';

/**
 * Resolves the appropriate SongwriterRole based on user input, genres, language, and cultural context.
 * Follows strict priority order (Phase 5.7 Standard):
 * 1. Explicit User Request
 * 2. Explicit Genre + Language Match
 * 3. Genre Family Match (Language-Adaptive)
 * 4. Contextual Story/Mood Signal Match
 * 5. Generic Multilingual Fallback
 */
export function resolveSongwriterRole(input: SongwriterRoleResolutionInput): ResolvedSongwriterRole {
  const language = (input.language || 'ไทย').trim().toLowerCase();
  const isThai =
    language === 'th' ||
    language === 'thai' ||
    language === 'ภาษาไทย' ||
    language === 'ไทย' ||
    language.includes('thai') ||
    language.includes('ไทย');

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
  const moods: string[] = Array.isArray(input.mood)
    ? input.mood
    : input.mood
    ? [input.mood]
    : [];
  const storyStyles: string[] = Array.isArray(input.storytellingStyle)
    ? input.storytellingStyle
    : input.storytellingStyle
    ? [input.storytellingStyle]
    : [];

  const allGenreText = [...genres, ...subgenres].join(' ').toLowerCase();
  const allContextText = [...genres, ...subgenres, ...moods, ...storyStyles, input.persona || '', input.story || '']
    .join(' ')
    .toLowerCase();

  const langProfile = getLanguageProfile(input.language);
  const langProfileCode = langProfile.languageCode;

  const fallbackRole = ROLE_REGISTRY['generic_multilingual'] || Object.values(ROLE_REGISTRY)[0];

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
      allGenreText.includes('หมอลำ') ||
      allGenreText.includes('อีสาน')
    ) {
      const role = ROLE_REGISTRY['thai_country_folk'] || fallbackRole;
      console.log(`[RoleResolver] language="Thai", genre="${allGenreText}", resolvedRole="${role.id}", source="GENRE_LANGUAGE_MATCH"`);
      return {
        role,
        languageProfileCode: langProfileCode,
        resolutionSource: 'GENRE_LANGUAGE_MATCH',
        matchReason: 'Matched Thai language with Country Folk / Luk Thung / Phleng Puea Chiwit genre profile',
      };
    }

    // Thai R&B / Soul / Neo-Soul / City Pop
    if (
      allGenreText.includes('r&b') ||
      allGenreText.includes('rnb') ||
      allGenreText.includes('soul') ||
      allGenreText.includes('neo-soul') ||
      allGenreText.includes('city pop') ||
      allGenreText.includes('urban')
    ) {
      const role = ROLE_REGISTRY['thai_rnb_soul'] || fallbackRole;
      console.log(`[RoleResolver] language="Thai", genre="${allGenreText}", resolvedRole="${role.id}", source="GENRE_LANGUAGE_MATCH"`);
      return {
        role,
        languageProfileCode: langProfileCode,
        resolutionSource: 'GENRE_LANGUAGE_MATCH',
        matchReason: 'Matched Thai language with Contemporary R&B / Soul / City Pop genre profile',
      };
    }

    // Thai Hip-Hop / Rap / Trap
    if (
      allGenreText.includes('hip-hop') ||
      allGenreText.includes('hiphop') ||
      allGenreText.includes('rap') ||
      allGenreText.includes('trap') ||
      allGenreText.includes('boom bap')
    ) {
      const role = ROLE_REGISTRY['thai_hiphop'] || fallbackRole;
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
  // Film / TV Soundtrack / Musical
  if (
    allGenreText.includes('ost') ||
    allGenreText.includes('soundtrack') ||
    allGenreText.includes('cinematic') ||
    allGenreText.includes('film') ||
    allGenreText.includes('ละคร') ||
    allGenreText.includes('ภาพยนตร์') ||
    allGenreText.includes('ซีรีส์')
  ) {
    const role = ROLE_REGISTRY['film_tv_songwriter'] || fallbackRole;
    console.log(`[RoleResolver] language="${input.language}", genre="${allGenreText}", resolvedRole="${role.id}", source="GENRE_FAMILY_MATCH"`);
    return {
      role,
      languageProfileCode: langProfileCode,
      resolutionSource: 'GENRE_FAMILY_MATCH',
      matchReason: 'Matched Soundtrack / OST / Cinematic storytelling genre family',
    };
  }

  // Indie Pop / Bedroom Pop / Dream Pop / Acoustic / Alternative Rock
  if (
    allGenreText.includes('indie') ||
    allGenreText.includes('bedroom pop') ||
    allGenreText.includes('dream pop') ||
    allGenreText.includes('alternative') ||
    allGenreText.includes('lo-fi') ||
    allGenreText.includes('acoustic pop') ||
    allGenreText.includes('อินดี้') ||
    allGenreText.includes('rock') ||
    allGenreText.includes('ร็อก')
  ) {
    const role = ROLE_REGISTRY['indie_pop'] || fallbackRole;
    console.log(`[RoleResolver] language="${input.language}", genre="${allGenreText}", resolvedRole="${role.id}", source="GENRE_FAMILY_MATCH"`);
    return {
      role,
      languageProfileCode: langProfileCode,
      resolutionSource: 'GENRE_FAMILY_MATCH',
      matchReason: 'Matched Indie Pop / Bedroom Pop / Alternative genre family',
    };
  }

  // Commercial / Mainstream / Dance Pop
  if (
    allGenreText.includes('pop') ||
    allGenreText.includes('dance') ||
    allGenreText.includes('synth pop') ||
    allGenreText.includes('ป๊อป') ||
    allGenreText.includes('ฮิต') ||
    allGenreText.includes('mainstream') ||
    allGenreText.includes('edm')
  ) {
    const role = ROLE_REGISTRY['commercial_pop'] || fallbackRole;
    console.log(`[RoleResolver] language="${input.language}", genre="${allGenreText}", resolvedRole="${role.id}", source="GENRE_FAMILY_MATCH"`);
    return {
      role,
      languageProfileCode: langProfileCode,
      resolutionSource: 'GENRE_FAMILY_MATCH',
      matchReason: 'Matched Commercial Pop / Mainstream / Dance Pop genre family',
    };
  }

  // -------------------------------------------------------------
  // Priority 4: Contextual Story / Mood Signal Match (Phase 5.7 Gate)
  // -------------------------------------------------------------
  if (isThai) {
    if (allContextText.includes('ลูกทุ่ง') || allContextText.includes('เถียงนา') || allContextText.includes('เพื่อชีวิต') || allContextText.includes('อีสาน')) {
      const role = ROLE_REGISTRY['thai_country_folk'] || fallbackRole;
      return {
        role,
        languageProfileCode: langProfileCode,
        resolutionSource: 'GENRE_FAMILY_MATCH',
        matchReason: 'Inferred Thai Country Folk role from story context and themes',
      };
    }
    if (allContextText.includes('อินดี้') || allContextText.includes('เหงา') || allContextText.includes('คาเฟ่')) {
      const role = ROLE_REGISTRY['indie_pop'] || fallbackRole;
      return {
        role,
        languageProfileCode: langProfileCode,
        resolutionSource: 'GENRE_FAMILY_MATCH',
        matchReason: 'Inferred Indie Pop role from story mood and setting signals',
      };
    }
  }

  // -------------------------------------------------------------
  // Priority 5: Generic Multilingual Fallback
  // -------------------------------------------------------------
  console.log(`[RoleResolver] language="${input.language}", genre="${allGenreText}", resolvedRole="${fallbackRole.id}", source="GENERIC_FALLBACK"`);
  return {
    role: fallbackRole,
    languageProfileCode: langProfileCode,
    resolutionSource: 'GENERIC_FALLBACK',
    matchReason: `No specific genre-language role matched for "${allGenreText}" in "${input.language}". Operating in Generic Multilingual Songwriter mode.`,
  };
}