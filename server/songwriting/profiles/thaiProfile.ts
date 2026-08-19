import { LanguageLyricProfile, LanguageSpecificScores, CraftIssue } from './types';
import { matchRuleBasedVocabulary } from '../../vocabulary/matcher';
import { buildLexicalContextVector } from '../../vocabulary/contextVector';
import { determineEvidenceTier, evaluateGenericnessAndSpecificity, evaluateNarrativeUtility } from '../../vocabulary/ranker';

export const ThaiLyricProfile: LanguageLyricProfile = {
  languageCode: 'th',
  languageName: 'Thai (ภาษาไทย)',
  isSupported: true,
  notes: 'Integrated with Thai Lexical Database, Dialect Matchers, and Evidence-Grounded Ranker (Phase 5.7 Gate Compliant)',

  registerModel: {
    allowedRegisters: ['spoken', 'conversational', 'neutral', 'dialect', 'poetic', 'literary'],
    defaultRegister: 'conversational',
  },

  naturalnessRules: [
    'ประโยคต้องเป็นภาษาพูดธรรมชาติที่เข้าปาก (Singable & Conversational) ห้ามใช้ภาษาเขียนหรือเล่าเรื่องแบบร้อยแก้วยาวๆ',
    'บังคับความสม่ำเสมอของพยางค์ (Syllable Balance): วรรคที่ทำหน้าที่คู่กันต้องมีจำนวนพยางค์เท่ากันหรือใกล้เคียงกัน (เช่น 7-7 หรือ 8-8) ห้ามสั้นยาวสลับกันจนผิดธรรมชาติของเมโลดี้',
    'โครงสร้างสัมผัสบังคับ (Thai Rhyme Scheme): คำสุดท้ายของวรรคก่อนหน้า ควรมีสัมผัสสระและมาตราตัวสะกด คล้องจองกับคำที่ 1, 2 หรือ 3 ของวรรคถัดไป',
    'หลีกเลี่ยงการลงท้ายวรรคด้วยสระเสียงสั้นหรือคำตาย (เช่น ติ, ขัด, ดุ) ยกเว้นในท่อนที่ต้องการความกระชับ ให้เน้นสระเสียงยาวเพื่อเอื้อต่อการลากเสียง',
    'ไม่ใช้คำหรูหรา วรรณคดี หรือศัพท์ทางการในเพลงแนวชาวบ้าน/ฮิปฮอป/เพื่อชีวิต',
    'ระวังการเรียงคำกลับหัวกลับหางเพื่อจงใจเอาสัมผัส (Unnatural word order)',
    'ไม่นำคำอุปมาเชิงคณิตศาสตร์หรือคอมพิวเตอร์มาใส่ในเพลง (เช่น คูณสอง, บวกหนึ่ง, 100%, รีเซ็ต)',
    'ห้ามใช้ศัพท์รายงานวิชาการหรือบทความวิจัย (เช่น บริบท, มิติ, ขับเคลื่อน, ปัจจัย, กำแพงชนชั้น)',
  ],

  collocationRules: [
    'หลีกเลี่ยงคำประสมผิดธรรมชาติ (Awkward Collocations เช่น วิ่งแส่, ตกหลุมความน่ารัก)',
    'หลีกเลี่ยงการใช้คำว่า "เด้อ" หรือคำถิ่นพร่ำเพรื่อหากเพลงใช้ภาษาไทยกลางเป็นหลัก',
  ],

  clichePatterns: [
    { pattern: 'รักเธอสุดหัวใจ', category: 'generic_love', suggestedAlternativeCategory: 'concrete_action_or_memory' },
    { pattern: 'คิดถึงเธอสุดหัวใจ', category: 'generic_longing', suggestedAlternativeCategory: 'sensory_scene_detail' },
    { pattern: 'น้ำตารินไหลอาบแก้ม', category: 'generic_sadness', suggestedAlternativeCategory: 'physical_reaction' },
    { pattern: 'รอวันเธอกลับมา', category: 'generic_waiting', suggestedAlternativeCategory: 'grounded_daily_action' },
    { pattern: 'ใจดวงน้อย', category: 'generic_diminutive', suggestedAlternativeCategory: 'direct_emotion' },
    { pattern: 'โลกมืดมน', category: 'generic_depression', suggestedAlternativeCategory: 'atmospheric_change' },
    { pattern: 'ขาดเธอไม่ได้', category: 'generic_dependency', suggestedAlternativeCategory: 'situational_detail' },
  ],

  avoidanceRules: [
    'ห้ามยัดเยียดวัตถุชนบทตามสูตรสำเร็จ (ควาย, เตาฟืน, เถียงนา) หาก User Story ไม่ได้ระบุ',
    'ห้ามใช้คำหยาบหรือภาษาหุ่นยนต์',
    'ห้ามแจกแจงลำดับเหตุการณ์แบบร้อยแก้ว (จากนั้นก็... แล้วจึง...)',
    'ห้ามยัดเยียดรายชื่อเครื่องมือช่างในท่อน Chorus หรือ Bridge',
  ],

  rhymeProsodyGuidance: 'ต้องมีสัมผัสสระระหว่างวรรค (Cross-line Rhyme) อย่างน้อย 1 คู่ในทุกๆ 4 บรรทัด โดยคำนึงถึงความเป็นธรรมชาติของภาษาพูดเป็นอันดับแรก ห้ามฝืนสัมผัสจนความหมายพัง',

  evaluateLanguageSpecifics: (line, sectionType, context) => {
    const trimmed = line.trim();
    const issues: CraftIssue[] = [];

    let naturalness = 5.0;
    let collocationFit = 5.0;
    let syntaxIntegrity = 5.0;
    let rhymeProsodyFit = 5.0;
    let clicheAvoidance = 5.0;
    let languageIntegrityScore = 5.0;

    // 1. Check English contamination in Thai context
    if (/[a-zA-Z]{3,}/.test(trimmed) && !context.genres?.some((g) => g.toLowerCase().includes('hip-hop') || g.toLowerCase().includes('inter'))) {
      languageIntegrityScore -= 2.0;
      issues.push({
        type: 'language-contamination',
        severity: 'critical',
        diagnosis: 'ตรวจพบภาษาอังกฤษปนเปื้อนในเนื้อเพลงภาษาไทย',
        evidence: trimmed,
        suggestedAction: 'ปรับเป็นภาษาไทยที่เป็นธรรมชาติ',
        strategy: 'improve_conversational_authenticity',
      });
    }

    // 2. Check Cliché Patterns
    for (const cp of ThaiLyricProfile.clichePatterns) {
      if (trimmed.includes(cp.pattern)) {
        clicheAvoidance -= 2.0;
        naturalness -= 0.5;
        issues.push({
          type: 'generic-emotional-filler',
          severity: 'warning',
          diagnosis: `พบวลีสำเร็จรูปซ้ำซาก: "${cp.pattern}" ที่สามารถสลับไปใส่เพลงรักเพลงไหนก็ได้`,
          evidence: cp.pattern,
          suggestedAction: `แทนที่ด้วยรายละเอียดเฉพาะของเรื่องราว (${cp.suggestedAlternativeCategory})`,
          strategy: 'replace_generic_emotion',
        });
      }
    }

    // 3. Check Robotic / Mathematical Metaphors
    const roboticMetaphors = ['คูณสอง', 'บวกหนึ่ง', 'คูณร้อย', 'หนึ่งร้อยเปอร์เซ็นต์', 'รีเซ็ต', 'ดาวน์โหลด'];
    for (const rm of roboticMetaphors) {
      if (trimmed.includes(rm)) {
        naturalness -= 2.5;
        collocationFit -= 2.0;
        issues.push({
          type: 'robotic-metaphor',
          severity: 'critical',
          diagnosis: `พบอุปมาภาษาคอมพิวเตอร์/คณิตศาสตร์ที่ไม่เป็นธรรมชาติ: "${rm}"`,
          evidence: rm,
          suggestedAction: 'เปลี่ยนเป็นภาษาพูดของมนุษย์',
          strategy: 'improve_conversational_authenticity',
        });
      }
    }

    // 4. Academic Jargon Check (Phase 5.7 Gate)
    const academicTerms = ['บริบท', 'มิติ', 'โครงสร้างทางสังคม', 'ขับเคลื่อน', 'ปัจจัย', 'กำแพงชนชั้น', 'พลวัต'];
    for (const at of academicTerms) {
      if (trimmed.includes(at)) {
        naturalness -= 2.0;
        issues.push({
          type: 'academic-jargon',
          severity: 'critical',
          diagnosis: `พบศัพท์วิชาการ/รายงานวิจัย: "${at}" ซึ่งขัดกับธรรมชาติของเนื้อเพลง`,
          evidence: at,
          suggestedAction: 'เปลี่ยนเป็นภาษาพูดและภาพเชิงรูปธรรม',
          strategy: 'improve_conversational_authenticity',
        });
      }
    }

    // 5. Narrative Prose Reporting Check (Phase 5.7 Gate)
    const prosePatterns = ['จากนั้นก็', 'แล้วจึง', 'หลังจากนั้น', 'ขั้นตอนต่อมา'];
    for (const pp of prosePatterns) {
      if (trimmed.includes(pp)) {
        naturalness -= 1.5;
        issues.push({
          type: 'narrative-prose-reporting',
          severity: 'warning',
          diagnosis: `พบการเล่าเรื่องแบบร้อยแก้วเรียงลำดับ: "${pp}"`,
          evidence: pp,
          suggestedAction: 'กระชับถ้อยคำให้เป็นจังหวะบทเพลง (Poetic Cadence)',
          strategy: 'improve_conversational_authenticity',
        });
      }
    }

    // 6. Vocational Tool Dumping in Hook/Chorus (Phase 5.7 Gate)
    const isHookSection = sectionType && /^(chorus|hook|bridge)$/i.test(sectionType);
    if (isHookSection) {
      const toolTerms = ['ประแจ', 'ค้อน', 'น็อต', 'ไขควง', 'อุปกรณ์เซฟตี้', 'เครื่องมือช่าง'];
      for (const tool of toolTerms) {
        if (trimmed.includes(tool)) {
          naturalness -= 2.0;
          issues.push({
            type: 'vocational-dump-in-hook',
            severity: 'critical',
            diagnosis: `พบการยัดเยียดรายชื่อเครื่องมือช่างในท่อน ${sectionType}: "${tool}"`,
            evidence: tool,
            suggestedAction: 'สงวนท่อนฮุกไว้สำหรับแก่นอารมณ์และสัจธรรมความรู้สึกหลัก',
            strategy: 'replace_generic_emotion',
          });
        }
      }
    }

    // 7. Check Persona Clash (e.g. Literary terms in folk/acoustic)
    const isRusticOrCasual = (context.characterVoice || '').includes('rustic') ||
      (context.genres || []).some((g) => g.includes('ลูกทุ่ง') || g.includes('เพื่อชีวิต') || g.includes('คันทรี'));
    
    if (isRusticOrCasual) {
      const formalLiteraryWords = ['ข้าพเจ้า', 'สุริยัน', 'นภาลัย', 'ดวงฤทัย', 'ภิรมย์', 'รัตติกาล', 'วิวาห์'];
      for (const flw of formalLiteraryWords) {
        if (trimmed.includes(flw)) {
          naturalness -= 2.0;
          collocationFit -= 1.5;
          issues.push({
            type: 'persona-break',
            severity: 'critical',
            diagnosis: `พบคำภาษาวรรณคดี/ทางการ "${flw}" ซึ่งขัดกับบุคลิกตัวละครที่เป็นคนบ้านนอก/คนธรรมดา`,
            evidence: flw,
            suggestedAction: 'ใช้คำพูดธรรมดาในชีวิตประจำวัน',
            strategy: 'increase_character_voice',
          });
        }
      }
    }

    return {
      scores: {
        naturalness: Math.max(1.0, Math.min(5.0, naturalness)),
        collocationFit: Math.max(1.0, Math.min(5.0, collocationFit)),
        syntaxIntegrity: Math.max(1.0, Math.min(5.0, syntaxIntegrity)),
        rhymeProsodyFit: Math.max(1.0, Math.min(5.0, rhymeProsodyFit)),
        clicheAvoidance: Math.max(1.0, Math.min(5.0, clicheAvoidance)),
        languageIntegrityScore: Math.max(1.0, Math.min(5.0, languageIntegrityScore)),
      },
      issues,
    };
  },
};