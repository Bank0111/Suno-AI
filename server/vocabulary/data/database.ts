import { VocabularyItem } from '../types';

/**
 * Categorized Thai Vocabulary Database
 * Sourced directly from SOURCE vocabularyEngine.ts with complete data fidelity (156 items)
 * merged with Target supplementary items.
 */
export const CATEGORIZED_VOCABULARY: VocabularyItem[] = [
    // Love / Romance
    { id: 'src-love-01', word: 'เชื่อ', categories: ['love', 'hope', 'motivation'], emotions: ['trust', 'hopeful'], genres: ['pop', 'rock', 'ballad', 'indie', 'lukthung'], priority: 1, tags: ['เชื่อมั่น', 'ศรัทธา'] },
    { id: 'src-love-02', word: 'ให้ใจ', categories: ['love'], emotions: ['devoted', 'romantic'], genres: ['pop', 'ballad', 'lukthung', 'rnb'], priority: 1, tags: ['จริงใจ', 'มอบใจ'] },
    { id: 'src-love-03', word: 'ทุ่มเท', categories: ['love', 'motivation'], emotions: ['earnest', 'devoted'], genres: ['pop', 'rock', 'ballad'], priority: 1, tags: ['พยายาม', 'ตั้งใจ'] },
    { id: 'src-love-04', word: 'หัวใจ', categories: ['love', 'heartbreak', 'longing', 'sadness'], emotions: ['romantic', 'sad', 'passionate'], priority: 1, tags: ['ใจ', 'ความรู้สึก'] },
    { id: 'src-love-05', word: 'ความรัก', categories: ['love', 'hope'], emotions: ['romantic', 'loving'], priority: 1, tags: ['รัก', 'ความผูกพัน'] },
    { id: 'src-love-06', word: 'รักแท้', categories: ['love', 'hope', 'faith'], emotions: ['devoted', 'hopeful'], genres: ['pop', 'ballad', 'lukthung'], priority: 1, tags: ['รักจริง', 'มั่นคง'] },
    { id: 'src-love-07', word: 'แสนดี', categories: ['love', 'nostalgia'], emotions: ['warm', 'wistful'], genres: ['pop', 'ballad'], priority: 1, tags: ['อบอุ่น', 'น่ารัก'] },
    { id: 'src-love-08', word: 'แอบชอบ', categories: ['love', 'modern'], emotions: ['shy', 'sweet'], genres: ['pop', 'indie', 'rnb', 'dance'], priority: 1, tags: ['แอบมอง', 'เขิน'] },
    { id: 'src-love-09', word: 'แอบมอง', categories: ['love', 'modern'], emotions: ['watchful', 'sweet'], genres: ['pop', 'indie', 'rnb'], priority: 1, tags: ['สายตา', 'มอง'] },
    { id: 'src-love-10', word: 'ล้นปรี่', categories: ['love', 'sadness'], emotions: ['overflowing'], genres: ['pop', 'ballad', 'traditional'], priority: 1, tags: ['เต็มหัวใจ', 'เปี่ยม'] },
    { id: 'src-love-11', word: 'โลกทั้งใบ', categories: ['love'], emotions: ['all-encompassing'], genres: ['pop', 'ballad', 'indie'], priority: 1, tags: ['จักรวาล', 'ทุกอย่าง'] },
    { id: 'src-love-12', word: 'รู้สึกเหมือนกัน', categories: ['love', 'modern'], emotions: ['mutual affection'], genres: ['pop', 'indie', 'rnb'], priority: 1, tags: ['ตรงกัน', 'ใจตรงกัน'] },
    { id: 'src-love-13', word: 'เดินเข้ามา', categories: ['love', 'modern'], emotions: ['approaching'], genres: ['pop', 'rnb', 'indie'], priority: 1, tags: ['เข้าหา', 'พบกัน'] },
    { id: 'src-love-14', word: 'เสียงหัวใจ', categories: ['love'], emotions: ['heartbeat'], genres: ['pop', 'ballad', 'rnb'], priority: 1, tags: ['เต้น', 'ข้างใน'] },
    { id: 'src-love-15', word: 'แนบที่ใจ', categories: ['love'], emotions: ['close to heart'], genres: ['pop', 'ballad'], priority: 1, tags: ['ใกล้ชิด', 'กอด'] },
    { id: 'src-love-16', word: 'สบตากัน', categories: ['love', 'modern'], emotions: ['eye contact'], genres: ['pop', 'indie', 'rnb'], priority: 1, tags: ['มองตา', 'แววตา'] },
    { id: 'src-love-17', word: 'สัญญา', categories: ['love', 'faith', 'nostalgia'], emotions: ['promise'], genres: ['pop', 'ballad', 'lukthung'], priority: 1, tags: ['คำสัญญา', 'สาบาน'] },
    { id: 'src-love-18', word: 'คุณค่าทางใจ', categories: ['love', 'nostalgia'], emotions: ['sentimental value'], genres: ['pop', 'ballad', 'indie'], priority: 1, tags: ['สำคัญ', 'ความจำ'] },
    { id: 'src-love-19', word: 'เก็บเอาเธอไปฝัน', categories: ['love', 'modern'], emotions: ['dreaming of you'], genres: ['pop', 'indie', 'rnb'], priority: 1, tags: ['ฝันถึง', 'ละเมอ'] },
    { id: 'src-love-20', word: 'กอดตอนนอน', categories: ['love', 'modern'], emotions: ['intimate', 'warm'], genres: ['pop', 'rnb', 'indie'], priority: 1, tags: ['กอด', 'อบอุ่น'] },
    { id: 'src-love-21', word: 'เชื่อใจ', categories: ['love', 'faith', 'hope'], emotions: ['trust'], genres: ['pop', 'ballad', 'rock'], priority: 1, tags: ['ไว้ใจ', 'มั่นใจ'] },
    { id: 'src-love-22', word: 'คบกับฉัน', categories: ['love', 'modern'], emotions: ['asking to date'], genres: ['pop', 'rnb', 'indie'], priority: 1, tags: ['แฟน', 'เป็นแฟน'] },
    { id: 'src-love-23', word: 'พบเธอ', categories: ['love'], emotions: ['meeting you'], priority: 1, tags: ['เจอ', 'พบกัน'] },
    { id: 'src-love-24', word: 'ยิ้ม', categories: ['love', 'hope'], emotions: ['smile'], priority: 1, tags: ['รอยยิ้ม', 'สดใส'] },
    { id: 'src-love-25', word: 'พูดคุย', categories: ['love', 'modern'], emotions: ['talking'], genres: ['pop', 'indie', 'rnb'], priority: 1, tags: ['สนทนา', 'ทักทาย'] },

    // Heartbreak / Sadness
    { id: 'src-sad-01', word: 'สุดท้าย', categories: ['heartbreak', 'nostalgia', 'sadness'], emotions: ['sorrow', 'finality'], genres: ['pop', 'ballad', 'rock', 'lukthung'], priority: 1, tags: ['จบ', 'อวสาน'] },
    { id: 'src-sad-02', word: 'เสียใจ', categories: ['heartbreak', 'sadness'], emotions: ['sad', 'regret'], genres: ['pop', 'ballad', 'rock', 'lukthung'], priority: 1, tags: ['เศร้า', 'เจ็บ'] },
    { id: 'src-sad-03', word: 'เสียน้ำตา', categories: ['heartbreak', 'sadness'], emotions: ['sad', 'crying'], genres: ['pop', 'ballad', 'lukthung'], priority: 1, tags: ['ร้องไห้', 'น้ำตา'] },
    { id: 'src-sad-04', word: 'เหงา', categories: ['sadness', 'longing'], emotions: ['lonely', 'pensive'], genres: ['pop', 'indie', 'ballad', 'rnb'], priority: 1, tags: ['อ้างว้าง', 'โดดเดี่ยว'] },
    { id: 'src-sad-05', word: 'ใจร้าย', categories: ['heartbreak', 'sadness'], emotions: ['hurt', 'disappointed'], genres: ['pop', 'lukthung', 'rock'], priority: 1, tags: ['ทำร้าย', 'เลือดเย็น'] },
    { id: 'src-sad-06', word: 'ครั้งสุดท้าย', categories: ['heartbreak', 'nostalgia'], emotions: ['sad', 'wistful'], genres: ['pop', 'ballad', 'rock'], priority: 1, tags: ['ลาก่อน', 'ลา'] },
    { id: 'src-sad-07', word: 'เศร้าใจ', categories: ['sadness', 'heartbreak'], emotions: ['sad', 'downhearted'], genres: ['pop', 'ballad', 'lukthung'], priority: 1, tags: ['สลด', 'หมองศรี'] },
    { id: 'src-sad-08', word: 'หวั่นไหว', categories: ['love', 'sadness'], emotions: ['anxious', 'fluttering'], genres: ['pop', 'ballad', 'rnb', 'indie'], priority: 1, tags: ['กังวล', 'สับสน'] },
    { id: 'src-sad-09', word: 'เงียบเหงา', categories: ['sadness', 'longing'], emotions: ['lonely', 'quiet'], genres: ['pop', 'indie', 'ballad'], priority: 1, tags: ['เงียบ', 'อ้างว้าง'] },
    { id: 'src-sad-10', word: 'เงียบงัน', categories: ['sadness', 'heartbreak'], emotions: ['silent', 'desolate'], genres: ['pop', 'ballad', 'rock', 'indie'], priority: 1, tags: ['สงบ', 'ไร้เสียง'] },
    { id: 'src-sad-11', word: 'ขาดใจ', categories: ['heartbreak', 'sadness'], emotions: ['intense sorrow', 'desperate'], genres: ['pop', 'ballad', 'rock', 'lukthung'], priority: 1, tags: ['เจ็บปวด', 'ทรมาร'] },
    { id: 'src-sad-12', word: 'ไม่ไหว', categories: ['heartbreak', 'sadness'], emotions: ['overwhelmed', 'helpless'], genres: ['pop', 'rock', 'ballad', 'rnb'], priority: 1, tags: ['ยอมแพ้', 'ทนไม่ไหว'] },
    { id: 'src-sad-13', word: 'พรากเจ้าไกล', categories: ['heartbreak', 'longing', 'traditional'], emotions: ['separated', 'tragic'], genres: ['traditional', 'lukthung', 'ballad'], priority: 1, tags: ['พราก', 'จากไกล'] },
    { id: 'src-sad-14', word: 'ช่วยบอกฉันที', categories: ['heartbreak', 'longing'], emotions: ['confused', 'seeking'], genres: ['pop', 'ballad', 'rock', 'rnb'], priority: 1, tags: ['ถาม', 'สงสัย'] },
    { id: 'src-sad-15', word: 'ลา', categories: ['heartbreak', 'nostalgia'], emotions: ['farewell'], priority: 1, tags: ['ลาก่อน', 'จาก'] },
    { id: 'src-sad-16', word: 'ไม่มีเธอ', categories: ['heartbreak', 'sadness', 'longing'], emotions: ['lonely', 'bereft'], genres: ['pop', 'ballad', 'rock', 'rnb'], priority: 1, tags: ['ขาดเธอ', 'สูญเสีย'] },
    { id: 'src-sad-17', word: 'ลาลับไกล', categories: ['heartbreak', 'sadness', 'nostalgia'], emotions: ['sorrowful', 'parting'], genres: ['ballad', 'pop', 'lukthung'], priority: 1, tags: ['จากไป', 'ไม่กลับ'] },
    { id: 'src-sad-18', word: 'ปั้นแต่ง', categories: ['heartbreak', 'modern'], emotions: ['fabricated', 'fake'], genres: ['pop', 'rock', 'hiphop'], priority: 1, tags: ['หลอกลวง', 'สร้างภาพ'] },
    { id: 'src-sad-19', word: 'สมใจ', categories: ['heartbreak', 'love'], emotions: ['satisfied', 'bitter'], genres: ['pop', 'ballad', 'lukthung', 'rock'], priority: 1, tags: ['พอใจ', 'สาแก่ใจ'] },
    { id: 'src-sad-20', word: 'เหี่ยวเฉา', categories: ['sadness', 'heartbreak'], emotions: ['withered'], genres: ['pop', 'ballad', 'indie'], priority: 1, tags: ['โรยรา', 'แห้งเหี่ยว'] },
    { id: 'src-sad-21', word: 'เห็นใจ', categories: ['love', 'sadness'], emotions: ['sympathetic'], genres: ['pop', 'ballad', 'lukthung'], priority: 1, tags: ['เมตตา', 'สงสาร'] },
    { id: 'src-sad-22', word: 'นั่งเศร้า', categories: ['sadness'], emotions: ['sitting sadly'], genres: ['pop', 'indie', 'lukthung'], priority: 1, tags: ['นั่งซึม', 'ก้มหน้า'] },
    { id: 'src-sad-23', word: 'วิ่งตามใคร', categories: ['heartbreak', 'sadness', 'modern'], emotions: ['chasing someone'], genres: ['pop', 'indie', 'rock'], priority: 1, tags: ['ไล่ตาม', 'เหนื่อย'] },
    { id: 'src-sad-24', word: 'เหตุผล', categories: ['heartbreak', 'sadness', 'modern'], emotions: ['reason'], genres: ['pop', 'ballad', 'rock'], priority: 1, tags: ['เพราะอะไร', 'ข้ออ้าง'] },

    // Longing / Nostalgia
    { id: 'src-long-01', word: 'เฝ้า', categories: ['longing', 'love'], emotions: ['waiting', 'devoted'], genres: ['pop', 'ballad', 'lukthung'], priority: 1, tags: ['คอย', 'เฝ้ารอ'] },
    { id: 'src-long-02', word: 'เฝ้ามอง', categories: ['longing', 'love'], emotions: ['watching over'], genres: ['pop', 'ballad', 'indie'], priority: 1, tags: ['มองดู', 'แอบดู'] },
    { id: 'src-long-03', word: 'จันทร์เจ้าเอย', categories: ['longing', 'nostalgia', 'nature'], emotions: ['poetic', 'wistful'], genres: ['pop', 'traditional', 'lukthung', 'indie'], priority: 1, tags: ['ดวงจันทร์', 'ไหว้พระจันทร์'] },
    { id: 'src-long-04', word: 'ล่องลอย', categories: ['longing', 'nostalgia', 'nature'], emotions: ['dreamy', 'drifting'], genres: ['pop', 'indie', 'rnb', 'ballad'], priority: 1, tags: ['ลอย', 'เคลิ้ม'] },
    { id: 'src-long-05', word: 'ล่องลอยคืนมา', categories: ['longing', 'hope', 'nostalgia'], emotions: ['yearning'], genres: ['pop', 'ballad', 'indie'], priority: 1, tags: ['ย้อนกลับ', 'หวัง'] },
    { id: 'src-long-06', word: 'งดงามเหมือนเคย', categories: ['nostalgia', 'love'], emotions: ['wistful', 'admiring'], genres: ['pop', 'ballad', 'indie'], priority: 1, tags: ['สวยงาม', 'เหมือนเดิม'] },
    { id: 'src-long-07', word: 'มองดู', categories: ['longing', 'nostalgia'], emotions: ['observant', 'pensive'], priority: 1, tags: ['สังเกต', 'เพ่งมอง'] },
    { id: 'src-long-08', word: 'ตามหา', categories: ['longing', 'hope', 'motivation'], emotions: ['searching'], genres: ['pop', 'rock', 'ballad', 'indie'], priority: 1, tags: ['ค้นหา', 'เสาะหา'] },
    { id: 'src-long-09', word: 'เวลา', categories: ['longing', 'nostalgia', 'sadness'], emotions: ['time'], priority: 1, tags: ['นาที', 'กาลเวลา'] },
    { id: 'src-long-10', word: 'รอนาน', categories: ['longing', 'sadness'], emotions: ['waiting long'], genres: ['pop', 'ballad', 'rnb'], priority: 1, tags: ['รอคอย', 'ช้านาน'] },
    { id: 'src-long-11', word: 'ขึ้นหิ้ง', categories: ['nostalgia', 'modern'], emotions: ['classic', 'pedestal'], genres: ['pop', 'hiphop', 'indie'], priority: 1, tags: ['คลาสสิก', 'บูชา'] },

    // Hope / Faith / Spiritual
    { id: 'src-faith-01', word: 'อธิษฐาน', categories: ['hope', 'faith'], emotions: ['prayerful', 'hopeful'], genres: ['pop', 'ballad', 'lukthung', 'traditional'], priority: 1, tags: ['พร', 'ขอพร'] },
    { id: 'src-faith-02', word: 'เทวดา', categories: ['faith', 'hope', 'traditional'], emotions: ['reverent', 'spiritual'], genres: ['lukthung', 'morlam', 'traditional', 'pop'], priority: 1, tags: ['ฟ้า', 'สิ่งศักดิ์สิทธิ์'] },
    { id: 'src-faith-03', word: 'สมดัง', categories: ['hope', 'faith'], emotions: ['fulfilled'], genres: ['lukthung', 'traditional', 'pop'], priority: 1, tags: ['สัมฤทธิ์', 'สมหวัง'] },
    { id: 'src-faith-04', word: 'ปรารถนา', categories: ['hope', 'love', 'longing'], emotions: ['desiring', 'passionate'], genres: ['pop', 'ballad', 'traditional'], priority: 1, tags: ['ความต้องการ', 'หวัง'] },
    { id: 'src-faith-05', word: 'จงเข้ามา', categories: ['hope', 'motivation', 'love'], emotions: ['inviting', 'bold'], genres: ['pop', 'rock', 'dance'], priority: 1, tags: ['ต้อนรับ', 'ก้าวเข้า'] },
    { id: 'src-faith-06', word: 'สาธุ', categories: ['faith'], emotions: ['reverent', 'blessed'], genres: ['lukthung', 'morlam', 'traditional', 'folk'], priority: 1, tags: ['ไหว้', 'บุญ'] },
    { id: 'src-faith-07', word: 'จุดธูป', categories: ['faith'], emotions: ['spiritual', 'sacred'], genres: ['lukthung', 'morlam', 'traditional', 'folk'], priority: 1, tags: ['กราบ', 'ขอพร'] },
    { id: 'src-faith-08', word: 'เก้าดอก', categories: ['faith'], emotions: ['spiritual'], genres: ['lukthung', 'morlam', 'traditional'], priority: 1, tags: ['ธูป', 'ศักดิ์สิทธิ์'] },
    { id: 'src-faith-09', word: 'สักการะ', categories: ['faith'], emotions: ['reverent'], genres: ['traditional', 'lukthung'], priority: 1, tags: ['เคารพ', 'บูชา'] },
    { id: 'src-faith-10', word: 'ย่อมือ', categories: ['faith', 'traditional'], emotions: ['reverent', 'respectful'], genres: ['lukthung', 'morlam', 'traditional'], priority: 1, tags: ['ไหว้', 'นอบน้อม'] },
    { id: 'src-faith-11', word: 'สุดศอก', categories: ['faith', 'traditional'], emotions: ['reverent'], genres: ['lukthung', 'morlam', 'traditional'], priority: 1, tags: ['ไหว้กราบ', 'ศรัทธา'] },
    { id: 'src-faith-12', word: 'พ้นศีรษะ', categories: ['faith', 'traditional'], emotions: ['reverent'], genres: ['lukthung', 'morlam', 'traditional'], priority: 1, tags: ['เทิดทูน', 'บูชา'] },
    { id: 'src-faith-13', word: 'มาลัยมาลา', categories: ['faith', 'traditional'], emotions: ['reverent', 'poetic'], genres: ['traditional', 'lukthung'], priority: 1, tags: ['ดอกไม้', 'พวงมาลัย'] },
    { id: 'src-faith-14', word: 'ตั้งจิต', categories: ['faith', 'hope'], emotions: ['focused', 'spiritual'], genres: ['lukthung', 'traditional', 'folk'], priority: 1, tags: ['สมาธิ', 'ตั้งใจ'] },
    { id: 'src-faith-15', word: 'ภาวนา', categories: ['faith', 'hope', 'longing'], emotions: ['prayerful', 'desperate'], genres: ['pop', 'ballad', 'lukthung', 'rock'], priority: 1, tags: ['สวดมนต์', 'ขอพร'] },
    { id: 'src-faith-16', word: 'ฟ้าลิขิต', categories: ['faith', 'love', 'traditional'], emotions: ['destined'], genres: ['pop', 'ballad', 'lukthung', 'traditional'], priority: 1, tags: ['โชคชะตา', 'สวรรค์'] },
    { id: 'src-faith-17', word: 'ฝากชีวิต', categories: ['faith', 'love'], emotions: ['devoted', 'serious'], genres: ['pop', 'ballad', 'lukthung'], priority: 1, tags: ['ผูกพัน', 'มอบชีวิต'] },
    { id: 'src-faith-18', word: 'ดั่งหวัง', categories: ['hope', 'motivation'], emotions: ['as wished'], genres: ['pop', 'ballad', 'lukthung'], priority: 1, tags: ['สมหวัง', 'สำเร็จ'] },
    { id: 'src-faith-19', word: 'ให้โอกาส', categories: ['hope', 'love', 'heartbreak'], emotions: ['seeking chance'], genres: ['pop', 'ballad', 'rnb'], priority: 1, tags: ['แก้มือ', 'ขอโอกาส'] },

    // Motivation / Life
    { id: 'src-moti-01', word: 'ก้าวข้าม', categories: ['motivation', 'hope'], emotions: ['overcoming'], genres: ['pop', 'rock', 'hiphop', 'ballad'], priority: 1, tags: ['ผ่านพ้น', 'ชนะ'] },
    { id: 'src-moti-02', word: 'ข้างนอกไม่สวย', categories: ['motivation', 'humor'], emotions: ['inner beauty'], genres: ['pop', 'indie', 'lukthung'], priority: 1, tags: ['จิตใจ', 'ภายนอก'] },
    { id: 'src-moti-03', word: 'ข้างในเป็นทอง', categories: ['motivation'], emotions: ['valuable'], genres: ['pop', 'indie', 'lukthung'], priority: 1, tags: ['มีค่า', 'เนื้อแท้'] },
    { id: 'src-moti-04', word: 'กำลังใจ', categories: ['motivation', 'hope'], emotions: ['encouraging'], genres: ['pop', 'rock', 'lukthung', 'folk'], priority: 1, tags: ['แรงใจ', 'สู้'] },
    { id: 'src-moti-05', word: 'เหนื่อยล้า', categories: ['motivation', 'sadness'], emotions: ['exhausted'], genres: ['pop', 'rock', 'indie', 'ballad'], priority: 1, tags: ['อ่อนแรง', 'พักผ่อน'] },

    // Isan Dialect
    { id: 'src-isan-01', word: 'เพิ่น', categories: ['isan', 'love', 'heartbreak'], emotions: ['regional', 'respectful'], genres: ['morlam', 'lukthung', 'isan-pop', 'folk'], regional: 'isan', priority: 1, tags: ['เขา', 'คุณ'] },
    { id: 'src-isan-02', word: 'ซ่อยที', categories: ['isan', 'sadness', 'faith'], emotions: ['pleading'], genres: ['morlam', 'lukthung', 'isan-pop'], regional: 'isan', priority: 1, tags: ['ช่วยด้วย', 'วอน'] },
    { id: 'src-isan-03', word: 'พ้อ', categories: ['isan', 'love', 'longing'], emotions: ['encounter'], genres: ['morlam', 'lukthung', 'isan-pop'], regional: 'isan', priority: 1, tags: ['เจอ', 'พบ'] },
    { id: 'src-isan-04', word: 'ความฮัก', categories: ['isan', 'love'], emotions: ['loving'], genres: ['morlam', 'lukthung', 'isan-pop'], regional: 'isan', priority: 1, tags: ['ความรัก', 'ฮัก'] },
    { id: 'src-isan-05', word: 'อีกจักหน', categories: ['isan', 'hope', 'longing'], emotions: ['pleading'], genres: ['morlam', 'lukthung', 'isan-pop'], regional: 'isan', priority: 1, tags: ['อีกครั้ง', 'หนเดียว'] },
    { id: 'src-isan-06', word: 'บ่ขอหยังหลาย', categories: ['isan', 'love', 'sadness'], emotions: ['humble'], genres: ['morlam', 'lukthung', 'isan-pop'], regional: 'isan', priority: 1, tags: ['ไม่ขออะไรมาก', 'ถ่อมตัว'] },
    { id: 'src-isan-07', word: 'ข่อย', categories: ['isan'], emotions: ['self-referential'], genres: ['morlam', 'lukthung', 'isan-pop'], regional: 'isan', priority: 1, tags: ['ฉัน', 'ผม'] },
    { id: 'src-isan-08', word: 'ผู้เดียว', categories: ['isan', 'sadness', 'longing'], emotions: ['lonely'], genres: ['morlam', 'lukthung', 'isan-pop'], regional: 'isan', priority: 1, tags: ['คนเดียว', 'ลำพัง'] },
    { id: 'src-isan-09', word: 'สาธุเด้อ', categories: ['isan', 'faith'], emotions: ['blessed', 'prayerful'], genres: ['morlam', 'lukthung', 'isan-pop'], regional: 'isan', priority: 1, tags: ['ขอพร', 'สาธุ'] },
    { id: 'src-isan-10', word: 'อ้าย', categories: ['isan', 'love', 'northern'], emotions: ['older brother / lover'], genres: ['morlam', 'lukthung', 'isan-pop', 'folk'], regional: 'isan', priority: 1, tags: ['พี่', 'คนรัก'] },

    // Northern Dialect
    { id: 'src-north-01', word: 'ขี้จุ๊', categories: ['northern', 'humor'], emotions: ['liar / teasing'], genres: ['northern-pop', 'lukthung', 'folk'], regional: 'northern', priority: 1, tags: ['โกหก', 'กวน'] },
    { id: 'src-north-02', word: 'ตั้ลลัลลา', categories: ['northern', 'modern'], emotions: ['cute chant'], genres: ['pop', 'northern-pop'], regional: 'northern', priority: 1, tags: ['น่ารัก', 'ร้อง'] },
    { id: 'src-north-03', word: 'หื้อ', categories: ['northern'], emotions: ['particle / give'], genres: ['northern-pop', 'lukthung', 'folk'], regional: 'northern', priority: 1, tags: ['ให้', 'คำสร้อย'] },
    { id: 'src-north-04', word: 'อู้', categories: ['northern'], emotions: ['speak'], genres: ['northern-pop', 'lukthung', 'folk'], regional: 'northern', priority: 1, tags: ['พูด', 'บอก'] },
    { id: 'src-north-05', word: 'บ่าได้ก๋า', categories: ['northern'], emotions: ['can\'t it be?'], genres: ['northern-pop', 'lukthung', 'folk'], regional: 'northern', priority: 1, tags: ['ไม่ได้หรือ', 'ถาม'] },

    // Southern Dialect
    { id: 'src-south-01', word: 'หาญ', categories: ['southern', 'motivation'], emotions: ['brave', 'bold'], genres: ['southern-rock', 'lukthung', 'folk'], regional: 'southern', priority: 1, tags: ['กล้า', 'ใจสู้'] },
    { id: 'src-south-02', word: 'แหลง', categories: ['southern'], emotions: ['speak'], genres: ['southern-rock', 'lukthung', 'folk'], regional: 'southern', priority: 1, tags: ['พูด', 'แหลงใต้'] },
    { id: 'src-south-03', word: 'แค่ๆ', categories: ['southern', 'love'], emotions: ['close by'], genres: ['southern-rock', 'lukthung', 'folk'], regional: 'southern', priority: 1, tags: ['ใกล้ๆ', 'ข้างๆ'] },
    { id: 'src-south-04', word: 'แล', categories: ['southern', 'love'], emotions: ['look / see'], genres: ['southern-rock', 'lukthung', 'folk'], regional: 'southern', priority: 1, tags: ['ดู', 'มอง'] },
    { id: 'src-south-05', word: 'ตะ', categories: ['southern'], emotions: ['particle'], genres: ['southern-rock', 'lukthung', 'folk'], regional: 'southern', priority: 1, tags: ['สิ', 'เถอะ'] },
    { id: 'src-south-06', word: 'น้องเห้อ', categories: ['southern', 'love', 'longing'], emotions: ['affectionate call'], genres: ['southern-rock', 'lukthung', 'folk'], regional: 'southern', priority: 1, tags: ['น้องเอ๋ย', 'คนดี'] },

    // Traditional / Poetic / Literature
    { id: 'src-trad-01', word: 'ดงพงพี', categories: ['traditional', 'nature'], emotions: ['wild', 'poetic'], genres: ['traditional', 'lukthung', 'folk'], priority: 1, tags: ['ป่าไม้', 'พงไพร'] },
    { id: 'src-trad-02', word: 'ทิวาราตรี', categories: ['traditional'], emotions: ['timeless', 'poetic'], genres: ['traditional', 'lukthung', 'ballad'], priority: 1, tags: ['วันคืน', 'กลางวันกลางคืน'] },
    { id: 'src-trad-03', word: 'เครื่องทรง', categories: ['traditional'], emotions: ['regal'], genres: ['traditional', 'lukthung'], priority: 1, tags: ['ชุดแต่งกาย', 'สง่างาม'] },
    { id: 'src-trad-04', word: 'รอนแรม', categories: ['traditional', 'longing'], emotions: ['wandering'], genres: ['traditional', 'lukthung', 'folk'], priority: 1, tags: ['เดินทาง', 'สัญจร'] },
    { id: 'src-trad-05', word: 'พารา', categories: ['traditional'], emotions: ['city / kingdom'], genres: ['traditional', 'lukthung'], priority: 1, tags: ['เมือง', 'นคร'] },
    { id: 'src-trad-06', word: 'เสี่ยงคู่', categories: ['traditional', 'love', 'faith'], emotions: ['fate', 'divination'], genres: ['traditional', 'lukthung'], priority: 1, tags: ['คู่ครอง', 'เสี่ยงทาย'] },
    { id: 'src-trad-07', word: 'เลื่องลือโฉม', categories: ['traditional', 'love'], emotions: ['admiring'], genres: ['traditional', 'lukthung'], priority: 1, tags: ['งดงาม', 'มีชื่อเสียง'] },
    { id: 'src-trad-08', word: 'ธิดา', categories: ['traditional'], emotions: ['daughter / maiden'], genres: ['traditional', 'lukthung'], priority: 1, tags: ['ลูกสาว', 'หญิงงาม'] },
    { id: 'src-trad-09', word: 'ร้อยหัวเมือง', categories: ['traditional'], emotions: ['grand'], genres: ['traditional', 'lukthung'], priority: 1, tags: ['ยิ่งใหญ่', 'กว้างใหญ่'] },
    { id: 'src-trad-10', word: 'เสี่ยงมาลัย', categories: ['traditional', 'love', 'faith'], emotions: ['fateful'], genres: ['traditional', 'lukthung'], priority: 1, tags: ['เสี่ยงทาย', 'รจนา'] },
    { id: 'src-trad-11', word: 'คู่ครอง', categories: ['traditional', 'love', 'faith'], emotions: ['devoted'], genres: ['pop', 'ballad', 'lukthung', 'traditional'], priority: 1, tags: ['คู่ชีวิต', 'สามีภรรยา'] },
    { id: 'src-trad-12', word: 'แม่รจนา', categories: ['traditional'], emotions: ['folklore'], genres: ['traditional', 'lukthung'], priority: 1, tags: ['วรรณคดี', 'สังข์ทอง'] },
    { id: 'src-trad-13', word: 'เจ้าเงาะ', categories: ['traditional'], emotions: ['folklore', 'humorous'], genres: ['traditional', 'lukthung'], priority: 1, tags: ['ตัวละคร', 'วรรณคดี'] },
    { id: 'src-trad-14', word: 'ย่างย้ำ', categories: ['traditional'], emotions: ['stepping'], genres: ['traditional', 'lukthung'], priority: 1, tags: ['ก้าวเดิน', 'ย่ำ'] },
    { id: 'src-trad-15', word: 'ทัดหู', categories: ['traditional', 'love'], emotions: ['tender', 'charming'], genres: ['pop', 'indie', 'lukthung', 'traditional'], priority: 1, tags: ['ดอกไม้ทัดหู', 'อ่อนโยน'] },
    { id: 'src-trad-16', word: 'ผิวคล้ำ', categories: ['traditional'], emotions: ['grounded', 'realistic'], genres: ['lukthung', 'traditional', 'folk'], priority: 1, tags: ['ผิวดำ', 'ธรรมชาติ'] },
    { id: 'src-trad-17', word: 'ผมหยิก', categories: ['traditional'], emotions: ['descriptive'], genres: ['lukthung', 'traditional', 'folk'], priority: 1, tags: ['ลักษณะ', 'ผม'] },
    { id: 'src-trad-18', word: 'ซาไก', categories: ['traditional'], emotions: ['folklore'], genres: ['traditional', 'lukthung'], priority: 1, tags: ['เงาะ', 'ชนเผ่า'] },
    { id: 'src-trad-19', word: 'ปากแดง', categories: ['traditional', 'modern'], emotions: ['vivid', 'alluring'], genres: ['pop', 'lukthung', 'hiphop', 'rnb'], priority: 1, tags: ['ริมฝีปาก', 'มีเสน่ห์'] },
    { id: 'src-trad-20', word: 'สุกในดง', categories: ['traditional', 'nature'], emotions: ['rustic'], genres: ['traditional', 'lukthung'], priority: 1, tags: ['ผลไม้', 'ธรรมชาติ'] },
    { id: 'src-trad-21', word: 'งามดั่งนางฟ้า', categories: ['traditional', 'love'], emotions: ['enchanted', 'admiring'], genres: ['pop', 'ballad', 'lukthung'], priority: 1, tags: ['งดงาม', 'สวรรค์'] },
    { id: 'src-trad-22', word: 'เออเออเอิงเอย', categories: ['traditional'], emotions: ['traditional vocal'], genres: ['traditional', 'lukthung'], priority: 1, tags: ['เอื้อน', 'ลูกทุ่ง'] },
    { id: 'src-trad-23', word: 'ชะเออเอิงเอย', categories: ['traditional'], emotions: ['traditional vocal'], genres: ['traditional', 'lukthung'], priority: 1, tags: ['เอื้อน', 'ลูกคู่'] },
    { id: 'src-trad-24', word: 'เอย', categories: ['traditional'], emotions: ['poetic ending'], genres: ['traditional', 'lukthung'], priority: 1, tags: ['คำสร้อย', 'ลงท้าย'] },

    // Nature / Sky
    { id: 'src-nat-01', word: 'ท้องฟ้า', categories: ['nature', 'longing', 'sadness'], emotions: ['vast', 'pensive'], genres: ['pop', 'indie', 'ballad', 'rock'], priority: 1, tags: ['ฟ้า', 'เมฆ'] },
    { id: 'src-nat-02', word: 'แสงดาว', categories: ['nature', 'hope', 'longing'], emotions: ['dreamy', 'hopeful'], genres: ['pop', 'ballad', 'indie'], priority: 1, tags: ['ดวงดาว', 'ค่ำคืน'] },
    { id: 'src-nat-03', word: 'ว่างเปล่า', categories: ['sadness', 'heartbreak'], emotions: ['empty', 'numb'], genres: ['pop', 'ballad', 'indie', 'rock'], priority: 1, tags: ['ไม่มีใคร', 'อ้างว้าง'] },
    { id: 'src-nat-04', word: 'ฟ้า', categories: ['nature', 'longing', 'hope'], emotions: ['expansive'], priority: 1, tags: ['นภา', 'ท้องฟ้า'] },
    { id: 'src-nat-05', word: 'แสงนวล', categories: ['nature', 'love', 'nostalgia'], emotions: ['soft', 'romantic'], genres: ['pop', 'traditional', 'ballad', 'jazz'], priority: 1, tags: ['จันทร์', 'ส่องแสง'] },
    { id: 'src-nat-06', word: 'ตะวัน', categories: ['nature', 'nostalgia', 'motivation'], emotions: ['bright', 'warm'], genres: ['pop', 'rock', 'folk', 'lukthung'], priority: 1, tags: ['ดวงอาทิตย์', 'เช้า'] },
    { id: 'src-nat-07', word: 'จันทร์ดวงน้อย', categories: ['nature', 'love', 'longing'], emotions: ['tender'], genres: ['pop', 'ballad', 'indie', 'traditional'], priority: 1, tags: ['ดวงจันทร์', 'อ่อนโยน'] },
    { id: 'src-nat-08', word: 'นภา', categories: ['nature', 'traditional', 'hope'], emotions: ['grand', 'poetic'], genres: ['pop', 'traditional', 'ballad'], priority: 1, tags: ['ท้องฟ้า', 'กว้างใหญ่'] },
    { id: 'src-nat-09', word: 'ส่องแสงเต็มฟ้า', categories: ['nature', 'hope', 'motivation'], emotions: ['radiant'], genres: ['pop', 'rock', 'ballad'], priority: 1, tags: ['สว่างไสว', 'เจิดจ้า'] },
    { id: 'src-nat-10', word: 'สวยงาม', categories: ['nature', 'love'], emotions: ['appreciative', 'beautiful'], priority: 1, tags: ['งดงาม', 'ประทับใจ'] },
    { id: 'src-nat-11', word: 'ดอกไม้', categories: ['nature', 'love', 'faith'], emotions: ['gentle', 'loving'], genres: ['pop', 'lukthung', 'traditional', 'indie'], priority: 1, tags: ['ผลิเบ่ง', 'สดชื่น'] },

    // Modern / Youth / English
    { id: 'src-mod-01', word: 'น่าขัน', categories: ['modern', 'humor'], emotions: ['playful', 'amused'], genres: ['pop', 'indie', 'hiphop'], priority: 1, tags: ['ตลก', 'ขำ'] },
    { id: 'src-mod-02', word: 'โทรหา', categories: ['modern', 'love', 'longing'], emotions: ['calling phone'], genres: ['pop', 'rnb', 'hiphop', 'indie'], priority: 1, tags: ['สายซ้อน', 'โทร'] },
    { id: 'src-mod-03', word: 'เข้าเรียน', categories: ['modern'], emotions: ['school life'], genres: ['pop', 'indie', 'rock'], priority: 1, tags: ['โรงเรียน', 'วัยเยาว์'] },
    { id: 'src-mod-04', word: 'นักร้องโรงเรียน', categories: ['modern', 'nostalgia'], emotions: ['school singer'], genres: ['pop', 'indie', 'rock'], priority: 1, tags: ['วงดนตรี', 'ศิษย์เก่า'] },
    { id: 'src-mod-05', word: 'เจ้าชู้', categories: ['modern', 'heartbreak', 'humor'], emotions: ['flirty / player'], genres: ['pop', 'lukthung', 'hiphop', 'rnb'], priority: 1, tags: ['หลายใจ', 'กะล่อน'] },
    { id: 'src-mod-06', word: 'ลองดู', categories: ['modern', 'hope', 'love'], emotions: ['try it out'], genres: ['pop', 'rnb', 'hiphop'], priority: 1, tags: ['พิสูจน์', 'เปิดใจ'] },
    { id: 'src-mod-07', word: 'ความรู้สึก', categories: ['modern', 'love', 'sadness'], emotions: ['emotions'], priority: 1, tags: ['อารมณ์', 'หัวใจ'] },
    { id: 'src-mod-08', word: 'Baby girl', categories: ['modern', 'love'], emotions: ['flirty', 'affectionate'], genres: ['hiphop', 'rnb', 'pop'], regional: 'english', priority: 1, tags: ['ที่รัก', 'สาวน้อย'] },
    { id: 'src-mod-09', word: 'first time', categories: ['modern', 'nostalgia'], emotions: ['first experience'], genres: ['pop', 'rnb', 'indie'], regional: 'english', priority: 1, tags: ['ครั้งแรก', 'ความทรงจำ'] },
    { id: 'src-mod-10', word: 'my girl', categories: ['modern', 'love'], emotions: ['affectionate'], genres: ['hiphop', 'rnb', 'pop'], regional: 'english', priority: 1, tags: ['แฟนสาว', 'คนของฉัน'] },
    { id: 'src-mod-11', word: 'Show', categories: ['modern'], emotions: ['performance'], genres: ['hiphop', 'pop', 'rock'], regional: 'english', priority: 1, tags: ['แสดง', 'เวที'] },
    { id: 'src-mod-12', word: 'Too Slow', categories: ['modern'], emotions: ['impatient'], genres: ['hiphop', 'rnb', 'pop'], regional: 'english', priority: 1, tags: ['ช้าไป', 'สายเกิน'] },
    { id: 'src-mod-13', word: 'you know', categories: ['modern'], emotions: ['casual'], genres: ['hiphop', 'rnb', 'pop'], regional: 'english', priority: 1, tags: ['เก็ทป่ะ', 'ก็รู้'] },
    { id: 'src-mod-14', word: 'beautiful', categories: ['modern', 'love'], emotions: ['admiring'], genres: ['pop', 'rnb', 'indie'], regional: 'english', priority: 1, tags: ['สวยงาม', 'งดงาม'] },
    { id: 'src-mod-15', word: 'so cute', categories: ['modern', 'love'], emotions: ['cute'], genres: ['pop', 'indie'], regional: 'english', priority: 1, tags: ['น่ารักมาก', 'ใจละลาย'] },
    { id: 'src-mod-16', word: 'fall in you', categories: ['modern', 'love'], emotions: ['falling in love'], genres: ['pop', 'rnb', 'indie'], regional: 'english', priority: 1, tags: ['ตกหลุมรัก', 'หลงรัก'] },

    // Supplementary Target Items
    { id: 'tgt-01', word: 'โอบกอด', category: 'Love & Connection', tags: ['กอด', 'อบอุ่น', 'ความรัก', 'ผูกพัน'], suitableGenres: ['Pop', 'R&B / Soul', 'Acoustic / Folk', 'Ballad'], suitableMoods: ['อบอุ่น (Warm)', 'โรแมนติก (Romantic)'], weight: 9 },
    { id: 'tgt-02', word: 'แววตา', category: 'Love & Connection', tags: ['ตา', 'มอง', 'ความรู้สึก'], suitableGenres: ['Pop', 'R&B / Soul', 'City Pop', 'Ballad'], suitableMoods: ['โรแมนติก (Romantic)'], weight: 8 },
    { id: 'tgt-03', word: 'เคียงข้าง', category: 'Love & Connection', tags: ['ข้างๆ', 'ร่วมทาง', 'ผูกพัน'], suitableGenres: ['Pop', 'Rock', 'Acoustic / Folk', 'Ballad'], weight: 8 },
    { id: 'tgt-04', word: 'จังหวะหัวใจ', category: 'Love & Connection', tags: ['เต้น', 'ตื่นเต้น', 'หัวใจ'], suitableGenres: ['Pop', 'Synth-pop / Dance', 'Funk / Disco'], weight: 7 },
    { id: 'tgt-05', word: 'พรหมลิขิต', category: 'Love & Connection', tags: ['โชคชะตา', 'เจอกัน', 'คู่กัน'], suitableGenres: ['Pop', 'Ballad'], weight: 6 },
    { id: 'tgt-06', word: 'ร่องรอย', category: 'Heartbreak & Loneliness', tags: ['แผล', 'อดีต', 'หลงเหลือ'], suitableGenres: ['R&B / Soul', 'Indie / Alternative', 'Ballad'], weight: 9 },
    { id: 'tgt-07', word: 'เจือจาง', category: 'Heartbreak & Loneliness', tags: ['เลือนลาง', 'หายไป', 'กาลเวลา'], suitableGenres: ['Indie / Alternative', 'Lo-Fi / Chill'], weight: 9 },
    { id: 'tgt-08', word: 'ความเงียบงัน', category: 'Heartbreak & Loneliness', tags: ['เงียบ', 'อ้างว้าง'], suitableGenres: ['Indie / Alternative', 'Ballad'], weight: 8 },
    { id: 'tgt-09', word: 'แตกสลาย', category: 'Heartbreak & Loneliness', tags: ['พัง', 'เจ็บปวด', 'พังทลาย'], suitableGenres: ['Rock', 'Metal', 'Ballad'], weight: 8 },
    { id: 'tgt-10', word: 'ห้วงคำนึง', category: 'Nostalgia & Memory', tags: ['ความคิด', 'ความทรงจำ', 'อดีต'], suitableGenres: ['City Pop', 'Indie / Alternative'], weight: 9 },
    { id: 'tgt-11', word: 'ย้อนเวลา', category: 'Nostalgia & Memory', tags: ['อดีต', 'เมื่อก่อน', 'เสียดาย'], suitableGenres: ['Pop', 'City Pop'], weight: 8 },
    { id: 'tgt-12', word: 'ภาพจำ', category: 'Nostalgia & Memory', tags: ['เห็น', 'ทรงจำ', 'ติดตา'], suitableGenres: ['Pop', 'R&B / Soul'], weight: 9 },
    { id: 'tgt-13', word: 'กาลครั้งหนึ่ง', category: 'Nostalgia & Memory', tags: ['นิทาน', 'เมื่อก่อน', 'เรื่องราว'], suitableGenres: ['Acoustic / Folk', 'Pop'], weight: 8 },
    { id: 'tgt-14', word: 'แสงไฟเมืองหลวง', category: 'Urban & Modern Life', tags: ['เมือง', 'กลางคืน', 'ส่องสว่าง'], suitableGenres: ['City Pop', 'Hip-Hop / Rap'], weight: 8 },
    { id: 'tgt-15', word: 'รถติด', category: 'Urban & Modern Life', tags: ['ถนน', 'รอ', 'เบื่อ'], suitableGenres: ['Hip-Hop / Rap', 'Lo-Fi / Chill'], weight: 7 },
    { id: 'tgt-16', word: 'กาแฟแก้วโปรด', category: 'Urban & Modern Life', tags: ['เช้า', 'คาเฟ่', 'พักผ่อน'], suitableGenres: ['Lo-Fi / Chill', 'Jazz'], weight: 8 },
    { id: 'tgt-17', word: 'สายลมยามเย็น', category: 'Nature & Atmosphere', tags: ['ลม', 'พัด', 'ผ่อนคลาย'], suitableGenres: ['Acoustic / Folk', 'Lo-Fi / Chill'], weight: 7 },
    { id: 'tgt-18', word: 'ท้องฟ้าสีหม่น', category: 'Nature & Atmosphere', tags: ['ฟ้า', 'ฝน', 'เมฆ'], suitableGenres: ['Indie / Alternative', 'Ballad'], weight: 7 },
    { id: 'tgt-19', word: 'กลิ่นฝน', category: 'Nature & Atmosphere', tags: ['ฝน', 'ดิน', 'ความสดชื่น'], suitableGenres: ['Acoustic / Folk', 'Lo-Fi / Chill'], weight: 9 },
    { id: 'tgt-20', word: 'ดวงดาว', category: 'Nature & Atmosphere', tags: ['คืน', 'ดาว', 'ท้องฟ้า'], suitableGenres: ['Pop', 'Ballad'], weight: 6 },
    { id: 'tgt-21', word: 'อรุณรุ่ง', category: 'Hope & Empowerment', tags: ['เช้าวันใหม่', 'เริ่มต้น'], suitableGenres: ['Pop', 'Rock'], weight: 8 },
    { id: 'tgt-22', word: 'ปีกแห่งความฝัน', category: 'Hope & Empowerment', tags: ['บิน', 'ฝัน', 'อิสระ'], suitableGenres: ['Pop', 'Rock'], weight: 7 },
    { id: 'tgt-23', word: 'เสียงคลื่น', category: 'Sensory & Abstract', tags: ['ทะเล', 'ฟัง', 'จังหวะ'], suitableGenres: ['Acoustic / Folk', 'Lo-Fi / Chill'], weight: 8 },
    { id: 'tgt-24', word: 'ไออุ่น', category: 'Sensory & Abstract', tags: ['ร้อน', 'อุ่น', 'กอด'], suitableGenres: ['R&B / Soul', 'Pop'], weight: 9 },
    { id: 'tgt-25', word: 'กลิ่นหอม', category: 'Sensory & Abstract', tags: ['ดม', 'น้ำหอม', 'สัมผัส'], suitableGenres: ['R&B / Soul', 'City Pop'], weight: 8 },
    { id: 'tgt-26', word: 'ดั่งผีเสื้อ', category: 'Poetic & Metaphorical', tags: ['บิน', 'งดงาม', 'อิสระ'], suitableGenres: ['Indie / Alternative'], weight: 8 },
    { id: 'tgt-27', word: 'เงาจันทร์', category: 'Poetic & Metaphorical', tags: ['คืน', 'เงา', 'จันทร์'], suitableGenres: ['R&B / Soul', 'Traditional'], weight: 8 },
    { id: 'tgt-28', word: 'คิดฮอด', category: 'Thai Regional & Dialect', tags: ['คิดถึง', 'อีสาน'], regionalTag: 'isan', weight: 10 },
    { id: 'tgt-29', word: 'กอดเสาเถียง', category: 'Thai Regional & Dialect', tags: ['กระท่อม', 'เถียงนา', 'อีสาน'], regionalTag: 'isan', weight: 10 },
    { id: 'tgt-30', word: 'กึดเติงหา', category: 'Thai Regional & Dialect', tags: ['คิดถึง', 'เหนือ', 'คำเมือง'], regionalTag: 'north', weight: 10 },
    { id: 'tgt-31', word: 'หลบแล้', category: 'Thai Regional & Dialect', tags: ['กลับบ้าน', 'ใต้'], regionalTag: 'south', weight: 10 }
];

/**
 * STRICT HARD-BANNED WORDS
 * Swear words, explicit vulgarities, illegal concepts, prohibited terms,
 * and BANNED_LYRIC_WORDS from Source (must retain hardBanned status).
 */
export const HARD_BANNED_WORDS: string[] = [
  'ควย', 'เหี้ย', 'สัส', 'เย็ด', 'มึงกู', 'กระจอก', 'หน้าด่าน', 'จิ๋ม', 'ดวย',
  'เย็ดแม่', 'ชั่วช้า', 'สลัดผัก', 'fuck', 'shit', 'bitch', 'sex', 'kill', 'death', 'blood',
  // BANNED_LYRIC_WORDS from Source geminiService.vocabulary.ts (strict hardBanned)
  'ตีสอง', 'ห้องเดิม', 'หน้าจอมือถือ', 'สตอรี่', 'มูฟออน', 'แชท', 'บล็อกเบอร์',
  'เพลย์ลิสต์', 'แก้วกาแฟ', 'ร้าน', 'รูปคู่', 'รูปถ่าย', 'แจ้งเตือน', 'อันฟอล',
  'หน้าจอ', 'ห้องนี้'
];

/**
 * OVERUSED CLICHÉ WORDS & PHRASES
 */
export const OVERUSED_CLICHES: string[] = [
  'ดวงดาวในคืนนี้',
  'สายลมพัดผ่าน',
  'น้ำตาหยดลงมา',
  'หัวใจแตกสลาย',
  'ท้องฟ้าสีเทา',
  'รักเธอคนเดียวตลอดไป',
  'ไม่มีเธอแล้วจะอยู่อย่างไร',
  'ความรักเหมือนฝัน',
  'กุมมือกันไว้',
  'เฝ้าคอยเธอสืบไป',
];

/**
 * CONTEXT CLASH RULES
 */
export const CONTEXT_CLASH_RULES: Array<{
  condition: {
    genres?: string[];
    moods?: string[];
    languageStyles?: string[];
  };
  clashWords: string[];
  reason: string;
}> = [
  {
    condition: {
      genres: ['Hip-Hop / Rap', 'Trap', 'EDM', 'Synth-pop / Dance', 'hiphop', 'dance'],
    },
    clashWords: [
      'ข้าพระพุทธเจ้า',
      'พระมารดา',
      'อสุรี',
      'ภิรมย์',
      'นฤมิต',
      'สุวรรณ',
      'พิศมัย',
      'อนงค์',
      'เครื่องทรง',
      'พารา',
      'ธิดา',
    ],
    reason: 'คำราชาศัพท์/บาลีสันสกฤตโบราณไม่เข้ากับแนวเพลง Modern Urban / Hip-Hop',
  },
  {
    condition: {
      moods: ['เศร้า (Sad / Melancholic)', 'เจ็บปวด (Heartbroken)', 'มืดมน (Dark / Somber)', 'เศร้า', 'sadness', 'heartbreak'],
    },
    clashWords: [
      'สดใสซาบซ่า',
      'ลั้นลา',
      'ฮาเฮ',
      'เริงร่า',
      'ยิ้มแย้มสดใส',
      'แฮปปี้',
    ],
    reason: 'คำสดใสเริงร่าขัดแย้งกับอารมณ์เพลงเศร้า/เจ็บปวด',
  },
  {
    condition: {
      languageStyles: ['ตรงไปตรงมา', 'ภาษาสตรีท / ทันสมัย'],
    },
    clashWords: [
      'ดั่งพุ่มพวง',
      'สวรรค์ชั้นเจ็ด',
      'ดั่งดวงหฤทัย',
      'บุพเพสันนิวาส',
      'กมลฉาย',
    ],
    reason: 'คำวรรณคดีโบราณขัดกับสไตล์ภาษาสตรีท/ตรงไปตรงมา',
  },
];

/**
 * EXCLUDED WORDS PRESET TEMPLATES (Sourced from translations.vocabulary.ts)
 */
export const EXCLUDED_WORDS_TEMPLATES = [
  { name: 'Clean / Safe', words: 'fuck, shit, damn, bitch, sex, kill, death, blood' },
  { name: 'No Romance', words: 'love, heart, baby, kiss, miss you, darling' }
];

/**
 * FAST FLOW / DOUBLE TIME COMPOSITION GUIDANCE (Sourced from translations.vocabulary.ts)
 */
export const FAST_FLOW_COMPOSITION_INSTRUCTION =
  'สำหรับท่อนที่ทำเครื่องหมาย [Fast Flow] หรือ [Double Time] ต้องแต่งด้วยคำที่มีความหนาแน่นของพยางค์สูง มีสัมผัสในถี่ๆ และจังหวะรัวเร็วแบบ Chopping Rap';
