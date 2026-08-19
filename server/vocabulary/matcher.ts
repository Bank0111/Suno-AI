import { SongConfig } from '../../src/types/songwriting';
import {
  SmartVocabularyResult,
  VocabularyEngineConfig,
  VocabularyItem,
  AvoidClassification,
  LexicalCandidate,
  LexicalIntentGroup,
} from './types';
import {
  CATEGORIZED_VOCABULARY,
  HARD_BANNED_WORDS,
  OVERUSED_CLICHES,
  CONTEXT_CLASH_RULES,
} from './data/database';
import { buildLexicalContextVector } from './contextVector';
import { rankLexicalCandidate, logLexicalSelection } from './ranker';

/**
 * Derives AvoidClassification with multi-tiered avoidance logic (Phase 5.7 Standard)
 */
export function buildAvoidClassification(config: SongConfig): AvoidClassification {
  const hardBanned = [...HARD_BANNED_WORDS];
  const overused = [...OVERUSED_CLICHES];
  const contextClashSet = new Set<string>();
  const contextualNotes: string[] = [];

  const genres = Array.from(
    new Set([
      ...(config.genres || []),
      ...(config.customGenre ? config.customGenre.split(',').map((s) => s.trim()).filter(Boolean) : []),
    ])
  );
  const moods = Array.from(
    new Set([
      ...(config.moods || []),
      ...(config.customMood ? config.customMood.split(',').map((s) => s.trim()).filter(Boolean) : []),
    ])
  );
  const langStyle = config.languageStyle || '';

  // Check Context Clash Rules
  for (const rule of CONTEXT_CLASH_RULES) {
    let matchesGenre = false;
    let matchesMood = false;
    let matchesStyle = false;

    if (rule.condition.genres) {
      matchesGenre = genres.some((g) =>
        rule.condition.genres!.some((cg) => g.toLowerCase().includes(cg.toLowerCase()) || cg.toLowerCase().includes(g.toLowerCase()))
      );
    }
    if (rule.condition.moods) {
      matchesMood = moods.some((m) =>
        rule.condition.moods!.some((cm) => m.toLowerCase().includes(cm.toLowerCase()) || cm.toLowerCase().includes(m.toLowerCase()))
      );
    }
    if (rule.condition.languageStyles) {
      matchesStyle = rule.condition.languageStyles.some((cs) => langStyle.toLowerCase().includes(cs.toLowerCase()));
    }

    if (matchesGenre || matchesMood || matchesStyle) {
      rule.clashWords.forEach((word) => contextClashSet.add(word));
      if (!contextualNotes.includes(rule.reason)) {
        contextualNotes.push(rule.reason);
      }
    }
  }

  // Specific contextual avoidance notes (Phase 5.7 Gate)
  const isFolkOrCountry = genres.some((g) => g.toLowerCase().includes('country') || g.toLowerCase().includes('folk') || g.toLowerCase().includes('ลูกทุ่ง'));
  if (isFolkOrCountry) {
    contextualNotes.push('หลีกเลี่ยงการใช้คำคณิตศาสตร์/การเปรียบเทียบเชิงเทคโนโลยี เช่น "คูณสอง", "บวกหนึ่ง" ในเพลงรักลูกทุ่ง/คันทรี');
    contextualNotes.push('หลีกเลี่ยงการใช้สำนวนแปลกที่ขัดกับการพูดจริง เช่น "วิ่งแส่หาใคร" หรือ "ใจมันพองโตขึ้นมา" ให้ใช้ภาษาพูดที่เป็นธรรมชาติ');
    contextualNotes.push('ห้ามยัดเยียดรายชื่อเครื่องมือช่างลงในท่อนฮุก (Mechanical Dump in Hook) เช่น "ประแจ", "น็อต", "สายพาน" ให้ท่อนฮุกเป็นพื้นที่ของแก่นอารมณ์และความเสียสละ');
  }

  const isRnbOrPop = genres.some((g) => g.toLowerCase().includes('r&b') || g.toLowerCase().includes('soul') || g.toLowerCase().includes('pop') || g.toLowerCase().includes('indie'));
  if (isRnbOrPop) {
    contextualNotes.push('หลีกเลี่ยงการอธิบายอารมณ์ตรงๆ ซ้ำซ้อน (Emotional Over-Explanation) เช่น "ภาพนี้ทำให้ฉันรู้สึกเศร้า" ให้เปิด Negative Space ผ่านภาพรูปธรรม');
  }

  // Academic and Prose notes for all contemporary genres
  contextualNotes.push('ห้ามใช้ศัพท์รายงานวิชาการหรือบทความวิจัย เช่น "บริบท", "มิติ", "ขับเคลื่อน", "ปัจจัย", "กำแพงชนชั้น"');
  contextualNotes.push('ห้ามเขียนแจกแจงลำดับเหตุการณ์แบบร้อยแก้ว เช่น "จากนั้นฉันก็...", "แล้วจึง...", "ขั้นตอนต่อไป"');

  return {
    hardBanned,
    overused,
    contextClash: Array.from(contextClashSet),
    contextualAvoidanceNotes: contextualNotes,
  };
}

/**
 * Context-Aware Lexical Matching Engine (Phase 1)
 * Retrieves and ranks candidate words based on the multi-dimensional Context Vector.
 */
export function matchRuleBasedVocabulary(
  config: SongConfig,
  options?: VocabularyEngineConfig
): SmartVocabularyResult {
  const vector = buildLexicalContextVector(config, options?.blueprint, options?.sectionType);

  const maxCore = options?.maxCoreWords || 8;
  const maxSupporting = options?.maxSupportingWords || 10;
  const maxOptional = options?.maxOptionalWords || 6;

  // 1. If Target Language is English, return focused English lyrical guidelines
  if (!vector.isTargetThai && vector.targetLanguage.toLowerCase() === 'english') {
    const avoid = buildAvoidClassification(config);
    return {
      core: ['heart', 'eyes', 'stay', 'remember', 'touch', 'night'],
      supporting: ['shadows', 'whisper', 'glow', 'moments', 'silence', 'dawn'],
      optional: ['fly', 'sky', 'dream', 'feel'],
      verseImagery: ['shadows', 'moments', 'silence', 'dawn'],
      sectionEmotion: ['heart', 'stay', 'remember'],
      hookCoreTerms: ['heart', 'eyes', 'stay'],
      intentGroups: [
        {
          intent: 'Core Emotional Intent',
          description: 'Primary narrative and emotional anchors in natural English',
          candidates: [
            { term: 'heart', register: 'conversational', genreFit: 0.9, personaFit: 0.9, languageFit: 1.0, score: 90 },
            { term: 'stay', register: 'conversational', genreFit: 0.9, personaFit: 0.9, languageFit: 1.0, score: 88 },
            { term: 'remember', register: 'conversational', genreFit: 0.85, personaFit: 0.85, languageFit: 1.0, score: 85 },
          ],
        },
      ],
      avoid,
      contextVector: vector,
      metadata: {
        source: 'context-aware-engine',
        songId: options?.songId,
        generatedAt: new Date().toISOString(),
        candidateCount: 16,
        targetLanguage: 'English',
      },
    };
  }

  // 2. Evaluate and Rank all candidates in database
  const scoredCandidates: LexicalCandidate[] = [];

  for (const item of CATEGORIZED_VOCABULARY) {
    const candidate = rankLexicalCandidate(item, vector, options?.sectionType);
    // Only accept candidates with acceptable language fit and positive score
    if (candidate.languageFit && candidate.languageFit >= 0.5 && (candidate.score || 0) > 20) {
      scoredCandidates.push(candidate);
    }
  }

  // Sort by composite score descending (Naturalness & Persona first)
  scoredCandidates.sort((a, b) => (b.score || 0) - (a.score || 0));

  // 3. Filter and partition into Core, Supporting, and Optional
  const preferredCandidates = scoredCandidates.filter((c) => c.avoidTier === 'PREFERRED' || !c.avoidTier);

  const coreList: string[] = [];
  const supportingList: string[] = [];
  const optionalList: string[] = [];

  const seenWords = new Set<string>();

  // Extract top Core candidates
  for (const c of preferredCandidates) {
    if (coreList.length >= maxCore) break;
    if (!seenWords.has(c.term)) {
      seenWords.add(c.term);
      coreList.push(c.term);
      logLexicalSelection('Core Intent Selection', c.term, true, {
        register: c.register,
        genreFit: c.genreFit,
        personaFit: c.personaFit,
        clicheRisk: c.clicheRisk,
        score: c.score,
        reason: c.reason,
      });
    }
  }

  // Extract Supporting candidates (Imagery / Atmosphere)
  for (const c of preferredCandidates) {
    if (supportingList.length >= maxSupporting) break;
    if (!seenWords.has(c.term)) {
      seenWords.add(c.term);
      supportingList.push(c.term);
      logLexicalSelection('Supporting Imagery Selection', c.term, true, {
        register: c.register,
        genreFit: c.genreFit,
        personaFit: c.personaFit,
        clicheRisk: c.clicheRisk,
        score: c.score,
        reason: c.reason,
      });
    }
  }

  // Extract Optional candidates
  for (const c of preferredCandidates) {
    if (optionalList.length >= maxOptional) break;
    if (!seenWords.has(c.term)) {
      seenWords.add(c.term);
      optionalList.push(c.term);
    }
  }

  // 4. Build Structured Phase 5.5A / 5.7 Categories
  const verseImageryCandidates = preferredCandidates
    .filter((c) => (c.sceneGrounding && c.sceneGrounding >= 0.75) || (c.source === 'scene-grounded'))
    .map((c) => c.term);
  const verseImagery: string[] = Array.from(
    new Set([...(vector.sceneObjects || []), ...verseImageryCandidates, ...supportingList])
  ).slice(0, 8);

  const sectionEmotionCandidates = preferredCandidates
    .filter((c) => (c.semanticMatch && c.semanticMatch >= 0.75) || (c.personaFit && c.personaFit >= 0.8))
    .map((c) => c.term);
  const sectionEmotion: string[] = Array.from(
    new Set([...sectionEmotionCandidates, ...coreList])
  ).slice(0, 8);

  // Hook Core Terms: Focus strictly on emotional truths and thematic anchors
  const hookCoreCandidates = preferredCandidates
    .filter((c) => (c.exactMatch || (c.sectionFit && c.sectionFit >= 0.9)) && (c.score || 0) >= 50)
    .map((c) => c.term);
  const hookCoreTerms: string[] = Array.from(
    new Set([...hookCoreCandidates, ...coreList.slice(0, 4)])
  ).slice(0, 6);

  // 5. Build Intent Groups
  const intentGroups: LexicalIntentGroup[] = [
    {
      intent: 'Core Narrative & Character Voice (แก่นเรื่องและเสียงตัวละคร)',
      description: `คำที่สะท้อนอารมณ์และบุคลิก "${vector.characterVoice.personaType}" ใน Register "${vector.characterVoice.targetRegister}"`,
      candidates: preferredCandidates.slice(0, 6),
    },
    {
      intent: 'Atmospheric & Imagery Anchors (ภาพและบรรยากาศ)',
      description: 'คำสร้างภาพที่เป็นรูปธรรม ไม่เป็นคำสำเร็จรูป',
      candidates: preferredCandidates.slice(6, 12),
    },
  ];

  // 6. Build Avoid Classification
  const avoid = buildAvoidClassification(config);

  const candidateCount = coreList.length + supportingList.length + optionalList.length;

  return {
    core: coreList,
    supporting: supportingList,
    optional: optionalList,
    verseImagery,
    sectionEmotion,
    hookCoreTerms,
    intentGroups,
    avoid,
    contextVector: vector,
    metadata: {
      source: 'context-aware-engine',
      songId: options?.songId,
      generatedAt: new Date().toISOString(),
      candidateCount,
      targetLanguage: vector.targetLanguage,
    },
  };
}