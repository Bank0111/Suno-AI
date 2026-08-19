import {
  SongInput,
  SongCreativeDirection,
  CreativeDirectionField,
  SongwritingStyle,
} from '../src/types/songwriting';

function cleanStr(v: any): string | undefined {
  if (v === null || v === undefined) return undefined;
  const str = String(v).trim();
  if (
    !str ||
    str.toLowerCase() === 'null' ||
    str.toLowerCase() === 'undefined' ||
    str === 'nan' ||
    str === '[object object]'
  ) {
    return undefined;
  }
  return str;
}

function cleanArr(arr: any): string[] {
  if (!Array.isArray(arr)) return [];
  return arr
    .map(cleanStr)
    .filter((item): item is string => typeof item === 'string' && item.length > 0);
}

function cleanBpm(v: any): number | undefined {
  if (v === null || v === undefined) return undefined;
  if (typeof v === 'number' && !isNaN(v) && v > 0) return v;
  if (typeof v === 'string') {
    const parsed = parseInt(v.replace(/\D/g, ''), 10);
    if (!isNaN(parsed) && parsed >= 40 && parsed <= 240) return parsed;
  }
  return undefined;
}

export function formatSongwritingStyleValue(style?: SongwritingStyle, custom?: string): string {
  if (custom && custom.trim()) return custom.trim();
  if (typeof style === 'string' && style.trim()) return style.trim();
  if (typeof style === 'object' && style !== null && style.name) {
    return `${style.name}${style.description ? ` (${style.description})` : ''}`;
  }
  return 'ให้ AI กำหนดสไตล์การแต่งเพลงที่เหมาะสมกับเรื่องราว';
}

/**
 * Builds a SongCreativeDirection from a ReferenceConfig and user SongInput (Phase 5.7).
 * Follows the strict priority: Explicit User Setting > Reference Direction > Auto from Story.
 */
export function deriveCreativeDirection(input: SongInput): SongCreativeDirection {
  const explicit = input.userExplicitSelections || {};
  const ref = input.reference;
  const isRefApplied = Boolean(ref && ref.applied === true && (ref.analysis || ref.source || ref.title));
  const refAnalysis = ref?.analysis || {};
  const refOverrides = ref?.userOverrides || {};
  const refTitle = cleanStr(ref?.title) || cleanStr(ref?.source) || 'เพลงอ้างอิง';

  // 1. GENRE & SUBGENRE
  let genre: CreativeDirectionField<string[] | string>;
  let subgenre: CreativeDirectionField<string> | undefined;
  const userHasCustomGenre = Boolean(input.customGenre && input.customGenre.trim());
  const userOverrideGenre = cleanStr(refOverrides.genre);
  const refGenres = cleanArr(refAnalysis.genre);
  const refSubgenre = cleanStr(refAnalysis.subgenre);

  if (userOverrideGenre) {
    genre = { value: [userOverrideGenre], source: 'user', sourceLabel: 'ผู้ใช้กำหนดเอง (Ref Override)' };
  } else if (userHasCustomGenre || (explicit.genre && input.genres && input.genres.length > 0)) {
    const combined = Array.from(new Set([
      ...(input.genres || []),
      ...(input.customGenre ? input.customGenre.split(',').map((s) => s.trim()).filter(Boolean) : []),
    ]));
    genre = { value: combined.length > 0 ? combined : ['Pop'], source: 'user', sourceLabel: 'ผู้ใช้กำหนดเอง' };
  } else if (isRefApplied && refGenres.length > 0) {
    genre = { value: refGenres, source: 'reference', sourceLabel: `เพลงอ้างอิง (${refTitle})` };
  } else {
    const defaultGenres = input.genres && input.genres.length > 0 ? input.genres : ['Pop'];
    genre = { value: defaultGenres, source: 'auto', sourceLabel: 'AI วิเคราะห์จาก Story' };
  }

  if (isRefApplied && refSubgenre) {
    subgenre = { value: refSubgenre, source: 'reference', sourceLabel: `เพลงอ้างอิง (${refTitle})` };
  }

  // 2. MOOD
  let mood: CreativeDirectionField<string[] | string>;
  const userHasCustomMood = Boolean(input.customMood && input.customMood.trim());
  const refMoods = cleanArr(refAnalysis.mood);

  if (userHasCustomMood || (explicit.mood && input.moods && input.moods.length > 0)) {
    const combined = Array.from(new Set([
      ...(input.moods || []),
      ...(input.customMood ? input.customMood.split(',').map((s) => s.trim()).filter(Boolean) : []),
    ]));
    mood = { value: combined.length > 0 ? combined : ['เศร้า'], source: 'user', sourceLabel: 'ผู้ใช้กำหนดเอง' };
  } else if (isRefApplied && refMoods.length > 0) {
    mood = { value: refMoods, source: 'reference', sourceLabel: `เพลงอ้างอิง (${refTitle})` };
  } else {
    const defaultMoods = input.moods && input.moods.length > 0 ? input.moods : ['เศร้า'];
    mood = { value: defaultMoods, source: 'auto', sourceLabel: 'AI วิเคราะห์จาก Story' };
  }

  // 3. TEMPO & BPM
  let tempo: CreativeDirectionField<string>;
  let bpm: CreativeDirectionField<number | string> | undefined;
  const userOverrideTempo = cleanStr(refOverrides.tempo);
  const refTempo = cleanStr(refAnalysis.tempo);
  const userBpm = cleanBpm(input.bpm);

  let parsedRefBpm: number | undefined;
  if (refTempo) {
    const bpmRangeMatch = refTempo.match(/(\d{2,3})\s*[-–~]\s*(\d{2,3})/);
    if (bpmRangeMatch) {
      const min = parseInt(bpmRangeMatch[1], 10);
      const max = parseInt(bpmRangeMatch[2], 10);
      if (!isNaN(min) && !isNaN(max)) {
        parsedRefBpm = Math.round((min + max) / 2);
      }
    } else {
      const singleMatch = refTempo.match(/(\d{2,3})\s*(?:bpm)?/i);
      if (singleMatch) {
        const num = parseInt(singleMatch[1], 10);
        if (num >= 40 && num <= 240) {
          parsedRefBpm = num;
        }
      }
    }
  }

  if (userOverrideTempo) {
    tempo = { value: userOverrideTempo, source: 'user', sourceLabel: 'ผู้ใช้กำหนดเอง (Ref Override)' };
    if (userBpm) {
      bpm = { value: userBpm, source: 'user', sourceLabel: 'ผู้ใช้กำหนดเอง' };
    }
  } else if (explicit.tempo || (input.tempo && input.tempo.includes('กำหนดเอง'))) {
    tempo = { value: input.tempo || 'ปานกลาง (80–100 BPM)', source: 'user', sourceLabel: 'ผู้ใช้กำหนดเอง' };
    if (userBpm) {
      bpm = { value: userBpm, source: 'user', sourceLabel: 'ผู้ใช้กำหนดเอง' };
    }
  } else if (isRefApplied && refTempo) {
    tempo = { value: refTempo, source: 'reference', sourceLabel: `เพลงอ้างอิง (${refTitle})` };
    if (explicit.bpm && userBpm) {
      bpm = { value: userBpm, source: 'user', sourceLabel: 'ผู้ใช้กำหนดเอง' };
    } else if (parsedRefBpm) {
      bpm = { value: parsedRefBpm, source: 'reference', sourceLabel: `เพลงอ้างอิง (${refTitle})` };
    } else if (userBpm) {
      bpm = { value: userBpm, source: 'auto', sourceLabel: 'AI แนะนำ' };
    }
  } else {
    tempo = { value: input.tempo || 'ปานกลาง (80–100 BPM)', source: 'auto', sourceLabel: 'AI วิเคราะห์จาก Story' };
    if (explicit.bpm && userBpm) {
      bpm = { value: userBpm, source: 'user', sourceLabel: 'ผู้ใช้กำหนดเอง' };
    } else if (userBpm) {
      bpm = { value: userBpm, source: 'auto', sourceLabel: 'AI แนะนำ' };
    }
  }

  // 4. RHYTHM / GROOVE
  let rhythm: CreativeDirectionField<string[] | string>;
  const refRhythm = cleanStr(refAnalysis.rhythm);

  if (explicit.rhythm && input.rhythmCharacteristics && input.rhythmCharacteristics.length > 0) {
    rhythm = { value: input.rhythmCharacteristics, source: 'user', sourceLabel: 'ผู้ใช้กำหนดเอง' };
  } else if (isRefApplied && refRhythm) {
    rhythm = { value: refRhythm, source: 'reference', sourceLabel: `เพลงอ้างอิง (${refTitle})` };
  } else {
    rhythm = {
      value: input.rhythmCharacteristics && input.rhythmCharacteristics.length > 0 ? input.rhythmCharacteristics : ['มีชีวิตชีวา'],
      source: 'auto',
      sourceLabel: 'AI วิเคราะห์จาก Story',
    };
  }

  // 5. VOCAL
  let vocal: CreativeDirectionField<string>;
  const userOverrideVocal = cleanStr(refOverrides.vocal);
  const userCustomVocal = cleanStr(input.vocalCustomDescription);
  const refVocal = cleanStr(refAnalysis.vocal);

  if (userOverrideVocal) {
    vocal = { value: userOverrideVocal, source: 'user', sourceLabel: 'ผู้ใช้กำหนดเอง (Ref Override)' };
  } else if (userCustomVocal || (explicit.vocal && input.vocalType)) {
    const val = input.vocalType === 'กำหนดเอง' && userCustomVocal ? `กำหนดเอง (${userCustomVocal})` : (input.vocalType || 'หญิง');
    vocal = { value: val, source: 'user', sourceLabel: 'ผู้ใช้กำหนดเอง' };
  } else if (isRefApplied && refVocal) {
    vocal = { value: refVocal, source: 'reference', sourceLabel: `เพลงอ้างอิง (${refTitle})` };
  } else {
    vocal = { value: input.vocalType || 'หญิง', source: 'auto', sourceLabel: 'AI วิเคราะห์จาก Story' };
  }

  // 6. INSTRUMENTATION
  let instrumentation: CreativeDirectionField<string[] | string>;
  const userOverrideInstr = cleanStr(refOverrides.instrumentation);
  const refInstr = cleanArr(refAnalysis.instrumentation);

  if (userOverrideInstr) {
    instrumentation = { value: [userOverrideInstr], source: 'user', sourceLabel: 'ผู้ใช้กำหนดเอง (Ref Override)' };
  } else if (isRefApplied && refInstr.length > 0) {
    instrumentation = { value: refInstr, source: 'reference', sourceLabel: `เพลงอ้างอิง (${refTitle})` };
  } else {
    instrumentation = { value: 'เครื่องดนตรีหลักตามแนวเพลงและอารมณ์', source: 'auto', sourceLabel: 'AI วิเคราะห์จาก Story' };
  }

  // 7. PRODUCTION CHARACTER
  let productionCharacter: CreativeDirectionField<string> | undefined;
  const refProd = cleanStr(refAnalysis.productionCharacter);
  if (isRefApplied && refProd) {
    productionCharacter = { value: refProd, source: 'reference', sourceLabel: `เพลงอ้างอิง (${refTitle})` };
  } else {
    productionCharacter = { value: 'Modern Clean Production สมดุลกับอารมณ์เพลง', source: 'auto', sourceLabel: 'AI วิเคราะห์จาก Story' };
  }

  // 8. SONGWRITING STYLE
  let songwritingStyle: CreativeDirectionField<string> | undefined;
  const userCustomStyle = cleanStr(input.customSongwritingStyle);
  const refLyricApproach = cleanStr(refAnalysis.lyricApproach);

  if (userCustomStyle || explicit.songwritingStyle) {
    songwritingStyle = {
      value: formatSongwritingStyleValue(input.songwritingStyle, userCustomStyle),
      source: 'user',
      sourceLabel: 'ผู้ใช้กำหนดเอง',
    };
  } else if (isRefApplied && refLyricApproach) {
    songwritingStyle = { value: refLyricApproach, source: 'reference', sourceLabel: `เพลงอ้างอิง (${refTitle})` };
  } else {
    songwritingStyle = {
      value: formatSongwritingStyleValue(input.songwritingStyle, input.customSongwritingStyle),
      source: 'auto',
      sourceLabel: 'AI วิเคราะห์จาก Story',
    };
  }

  // 9. LANGUAGE STYLE
  let languageStyle: CreativeDirectionField<string> | undefined;
  if (explicit.languageStyle && input.languageStyle) {
    languageStyle = { value: input.languageStyle, source: 'user', sourceLabel: 'ผู้ใช้กำหนดเอง' };
  } else {
    languageStyle = { value: input.languageStyle || 'ตรงไปตรงมา เข้าถึงง่าย', source: 'auto', sourceLabel: 'AI วิเคราะห์จาก Story' };
  }

  // 10. RHYME STYLE
  let rhymeStyle: CreativeDirectionField<string> | undefined;
  const refRhyme = cleanStr(refAnalysis.rhymeApproach);
  if (explicit.rhymeStyle && input.rhymeStyle && input.rhymeStyle !== 'ให้ AI เลือกให้เหมาะสม') {
    rhymeStyle = { value: input.rhymeStyle, source: 'user', sourceLabel: 'ผู้ใช้กำหนดเอง' };
  } else if (isRefApplied && refRhyme) {
    rhymeStyle = { value: refRhyme, source: 'reference', sourceLabel: `เพลงอ้างอิง (${refTitle})` };
  } else {
    rhymeStyle = { value: input.rhymeStyle || 'ให้ AI เลือกให้เหมาะสมกับสไตล์เพลง', source: 'auto', sourceLabel: 'AI วิเคราะห์จาก Story' };
  }

  // 11. STRUCTURE
  let structure: CreativeDirectionField<string[] | string> | undefined;
  let suggestedStructure: {
    source: 'reference' | 'auto' | 'user';
    sections: string[];
    sourceLabel?: string;
    rationale?: string;
  } | undefined;

  const rawRefStruct = cleanArr(refAnalysis.structure);
  const normalizedRefStruct = rawRefStruct.map((s) => s.replace(/^\d+[\.\-\)]\s*/, '').trim()).filter(Boolean);

  // Genre-Aware Structure Selector (Phase 5.7 Standards)
  const getGenreAwareStructure = (genresList: string[], moodsList: string[]): { sections: string[]; rationale: string } => {
    const combinedStr = [...genresList, ...moodsList].join(' ').toLowerCase();

    if (combinedStr.includes('country') || combinedStr.includes('folk') || combinedStr.includes('ลูกทุ่ง') || combinedStr.includes('เพื่อชีวิต')) {
      return {
        sections: ['Intro', 'Verse 1', 'Verse 2', 'Chorus', 'Verse 3', 'Chorus', 'Bridge', 'Chorus', 'Outro'],
        rationale: 'โครงสร้างแบบ Country / Folk / ลูกทุ่ง ที่เน้นการเล่าเรื่องผ่าน Verse ต่อเนื่อง สลับกับ Chorus และ Bridge เปิดมุมมอง',
      };
    }
    if (combinedStr.includes('r&b') || combinedStr.includes('soul') || combinedStr.includes('neo-soul') || combinedStr.includes('city pop')) {
      return {
        sections: ['Intro', 'Verse 1', 'Pre-Chorus', 'Chorus', 'Verse 2', 'Pre-Chorus', 'Chorus', 'Bridge', 'Chorus', 'Outro'],
        rationale: 'โครงสร้างแบบ R&B / Soul / City Pop ที่มี Pre-Chorus ทอดอารมณ์ และ Bridge ตกผลึกความรู้สึก',
      };
    }
    if (combinedStr.includes('hip') || combinedStr.includes('rap') || combinedStr.includes('trap')) {
      return {
        sections: ['Intro', 'Verse 1', 'Hook', 'Verse 2', 'Hook', 'Rap Breakdown', 'Hook', 'Outro'],
        rationale: 'โครงสร้างแบบ Hip-Hop / Rap เน้นท่อน Hook กระแทกใจ และ Verse 16-bar สำหรับการถ่ายทอดไรม์',
      };
    }
    if (combinedStr.includes('rock') || combinedStr.includes('alternative') || combinedStr.includes('metal')) {
      return {
        sections: ['Intro', 'Verse 1', 'Pre-Chorus', 'Chorus', 'Verse 2', 'Pre-Chorus', 'Chorus', 'Guitar Solo / Bridge', 'Chorus', 'Outro'],
        rationale: 'โครงสร้างแบบ Rock / Alternative ที่เน้นการสร้าง Tension และปล่อยพลังในท่อน Chorus และ Bridge',
      };
    }
    if (combinedStr.includes('edm') || combinedStr.includes('dance') || combinedStr.includes('electronic')) {
      return {
        sections: ['Intro', 'Verse', 'Pre-Chorus', 'Drop / Chorus', 'Breakdown', 'Pre-Chorus', 'Drop / Chorus', 'Outro'],
        rationale: 'โครงสร้างแบบ EDM / Dance ที่มีท่อน Drop และ Breakdown เพื่อควบคุมระดับพลังงาน',
      };
    }
    if (combinedStr.includes('ballad') || combinedStr.includes('acoustic') || combinedStr.includes('เศร้า') || combinedStr.includes('slow')) {
      return {
        sections: ['Intro', 'Verse 1', 'Chorus', 'Verse 2', 'Chorus', 'Bridge', 'Final Chorus', 'Outro'],
        rationale: 'โครงสร้างแบบ Ballad เพื่อไต่ระดับอารมณ์และส่งพลังสูงสุดในท่อน Bridge สู่ Final Chorus',
      };
    }
    return {
      sections: ['Intro', 'Verse 1', 'Pre-Chorus', 'Chorus', 'Verse 2', 'Pre-Chorus', 'Chorus', 'Bridge', 'Chorus', 'Outro'],
      rationale: 'โครงสร้างเพลงป๊อปมาตรฐาน (Standard Pop Structure) ที่มีความลื่นไหลและสมดุล',
    };
  };

  if (explicit.structure && input.structure && input.structure.length > 0) {
    structure = {
      value: input.structure,
      source: 'user',
      sourceLabel: 'ผู้ใช้กำหนดเอง',
      rationale: 'โครงสร้างที่ผู้ใช้เลือกหรือปรับแต่งโดยตรง',
    };
    suggestedStructure = {
      source: 'user',
      sections: input.structure,
      sourceLabel: 'ผู้ใช้กำหนดเอง',
      rationale: 'โครงสร้างที่ผู้ใช้เลือกหรือปรับแต่งโดยตรง',
    };
  } else if (isRefApplied && normalizedRefStruct.length > 0) {
    structure = {
      value: normalizedRefStruct,
      source: 'reference',
      sourceLabel: `เพลงอ้างอิง (${refTitle})`,
      rationale: 'เลือกตามลักษณะการเล่าเรื่องและโครงสร้างของเพลงอ้างอิง',
    };
    suggestedStructure = {
      source: 'reference',
      sections: normalizedRefStruct,
      sourceLabel: `เพลงอ้างอิง (${refTitle})`,
      rationale: 'เลือกตามลักษณะการเล่าเรื่องและโครงสร้างของเพลงอ้างอิง',
    };
  } else if (isRefApplied) {
    const genreAware = getGenreAwareStructure(refGenres.length > 0 ? refGenres : ['Pop'], refMoods);
    structure = {
      value: genreAware.sections,
      source: 'reference',
      sourceLabel: `เพลงอ้างอิง (${refTitle})`,
      rationale: 'เลือกตามลักษณะการเล่าเรื่องและโครงสร้างของเพลงอ้างอิง',
    };
    suggestedStructure = {
      source: 'reference',
      sections: genreAware.sections,
      sourceLabel: `เพลงอ้างอิง (${refTitle})`,
      rationale: 'เลือกตามลักษณะการเล่าเรื่องและโครงสร้างของเพลงอ้างอิง',
    };
  } else {
    const currentGenres = input.genres && input.genres.length > 0 ? input.genres : ['Pop'];
    const currentMoods = input.moods && input.moods.length > 0 ? input.moods : ['เศร้า'];
    const autoStruct = getGenreAwareStructure(currentGenres, currentMoods);

    structure = {
      value: autoStruct.sections,
      source: 'auto',
      sourceLabel: 'AI วิเคราะห์จาก Story & แนวเพลง',
      rationale: autoStruct.rationale,
    };
    suggestedStructure = {
      source: 'auto',
      sections: autoStruct.sections,
      sourceLabel: 'AI วิเคราะห์จาก Story & แนวเพลง',
      rationale: autoStruct.rationale,
    };
  }

  return {
    genre,
    subgenre,
    mood,
    tempo,
    bpm,
    rhythm,
    vocal,
    instrumentation,
    productionCharacter,
    songwritingStyle,
    languageStyle,
    rhymeStyle,
    structure,
    suggestedStructure,
  };
}