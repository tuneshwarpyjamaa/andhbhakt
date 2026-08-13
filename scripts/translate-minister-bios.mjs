/**
 * Generates concise Hindi biographies for all 73 ministers using OpenAI.
 * No Wikipedia fetch — GPT writes from its own knowledge.
 * Output: artifacts/govlens/src/data/minister-bio-hi.json (keyed by slug)
 * Resume-safe: skips slugs already present with non-empty values.
 *
 * Run: node scripts/translate-minister-bios.mjs
 */

import fs from 'fs';

const OUT = 'artifacts/govlens/src/data/minister-bio-hi.json';
const OPENAI_KEY = process.env.OPENAI_API_KEY;
const OPENAI_BASE = 'https://api.openai.com';
const MODEL = 'gpt-4.1-mini';
const CONCURRENCY = 6;

// [slug, full English name, role/ministry]
const MINISTERS = [
  ['narendra-modi',              'Narendra Modi',              'Prime Minister of India'],
  ['rajnath-singh',              'Rajnath Singh',              'Union Defence Minister'],
  ['amit-shah',                  'Amit Shah',                  'Union Home Minister'],
  ['nitin-gadkari',              'Nitin Gadkari',              'Union Road Transport Minister'],
  ['jp-nadda',                   'J.P. Nadda',                 'Union Health Minister, BJP President'],
  ['shivraj-singh-chouhan',      'Shivraj Singh Chouhan',      'Union Agriculture Minister, former CM of MP'],
  ['nirmala-sitharaman',         'Nirmala Sitharaman',         'Union Finance Minister'],
  ['s-jaishankar',               'S. Jaishankar',              'Union External Affairs Minister'],
  ['manohar-lal-khattar',        'Manohar Lal Khattar',        'Union Housing Minister, former CM of Haryana'],
  ['hd-kumaraswamy',             'H.D. Kumaraswamy',           'Union Heavy Industries Minister, former CM of Karnataka'],
  ['piyush-goyal',               'Piyush Goyal',               'Union Commerce Minister'],
  ['dharmendra-pradhan',         'Dharmendra Pradhan',         'Union Education Minister'],
  ['jitan-ram-manjhi',           'Jitan Ram Manjhi',           'Union MSME Minister, former CM of Bihar'],
  ['lalan-singh',                'Rajiv Ranjan Singh (Lalan Singh)', 'Union Panchayati Raj Minister'],
  ['sarbananda-sonowal',         'Sarbananda Sonowal',         'Union Ports Minister, former CM of Assam'],
  ['virendra-kumar',             'Virendra Kumar',             'Union Social Justice Minister'],
  ['ram-mohan-naidu',            'Kinjarapu Ram Mohan Naidu',  'Union Civil Aviation Minister'],
  ['pralhad-joshi',              'Pralhad Joshi',              'Union New and Renewable Energy Minister'],
  ['jual-oram',                  'Jual Oram',                  'Union Tribal Affairs Minister'],
  ['giriraj-singh',              'Giriraj Singh',              'Union Textiles Minister'],
  ['jyotiraditya-scindia',       'Jyotiraditya Scindia',       'Union Communications Minister'],
  ['bhupender-yadav',            'Bhupender Yadav',            'Union Environment Minister'],
  ['gajendra-singh-shekhawat',   'Gajendra Singh Shekhawat',   'Union Culture Minister'],
  ['annpurna-devi',              'Annpurna Devi',              'Union Women and Child Development Minister'],
  ['kiren-rijiju',               'Kiren Rijiju',               'Union Parliamentary Affairs Minister'],
  ['hardeep-singh-puri',         'Hardeep Singh Puri',         'Union Petroleum Minister'],
  ['mansukh-mandaviya',          'Mansukh Mandaviya',          'Union Labour Minister'],
  ['cr-patil',                   'C.R. Patil',                 'Union Jal Shakti Minister, BJP Gujarat President'],
  ['ashwini-vaishnaw',           'Ashwini Vaishnaw',           'Union Railways and IT Minister'],
  ['chirag-paswan',              'Chirag Paswan',              'Union Food Processing Minister, LJP leader'],
  ['g-kishan-reddy',             'G. Kishan Reddy',            'Union Coal Minister, BJP Telangana President'],
  ['rao-inderjit-singh',         'Rao Inderjit Singh',         'Union Statistics Minister'],
  ['jitendra-singh',             'Jitendra Singh',             'Union Science and Technology Minister'],
  ['arjun-ram-meghwal',          'Arjun Ram Meghwal',          'Union Law Minister'],
  ['jayant-chaudhary',           'Jayant Chaudhary',           'Union Skill Development Minister, RLD leader'],
  ['jitin-prasada',              'Jitin Prasada',              'Union Commerce MoS'],
  ['sp-singh-baghel',            'S.P. Singh Baghel',          'Union Fisheries MoS'],
  ['shobha-karandlaje',          'Shobha Karandlaje',          'Union Micro Industries MoS'],
  ['krishan-pal-gurjar',         'Krishan Pal Gurjar',         'Union Power MoS'],
  ['ram-nath-thakur',            'Ram Nath Thakur',            'Union Agriculture MoS'],
  ['nityanand-rai',              'Nityanand Rai',              'Union Home MoS'],
  ['anupriya-patel',             'Anupriya Patel',             'Union Health MoS, Apna Dal leader'],
  ['v-somanna',                  'V. Somanna',                 'Union Jal Shakti MoS'],
  ['chandra-sekhar-pemmasani',   'Chandra Sekhar Pemmasani',   'Union External Affairs MoS'],
  ['l-murugan',                  'L. Murugan',                 'Union Information and Broadcasting MoS'],
  ['suresh-gopi',                'Suresh Gopi',                'Union Tourism MoS, Malayalam film actor'],
  ['ajay-tamta',                 'Ajay Tamta',                 'Union Textiles MoS'],
  ['bandi-sanjay-kumar',         'Bandi Sanjay Kumar',         'Union Home MoS, Telangana BJP leader'],
  ['kamlesh-paswan',             'Kamlesh Paswan',             'Union Rural Development MoS'],
  ['pabitra-margherita',         'Pabitra Margherita',         'Union External Affairs MoS'],
  ['sukanta-majumdar',           'Sukanta Majumdar',           'Union Education MoS, BJP West Bengal President'],
  ['op-choudhary',               'O.P. Choudhary',             'Union Finance MoS'],
  ['harsh-malhotra',             'Harsh Malhotra',             'Union Corporate Affairs MoS'],
  ['sanjay-seth',                'Sanjay Seth',                'Union Defence MoS'],
  ['ravneet-singh-bittu',        'Ravneet Singh Bittu',        'Union Railways MoS, grandson of Beant Singh'],
  ['durga-das-uikey',            'Durga Das Uikey',            'Union Tribal Affairs MoS'],
  ['raksha-khadse',              'Raksha Khadse',              'Union Youth Affairs MoS, daughter-in-law of Eknath Khadse'],
  ['savitri-thakur',             'Savitri Thakur',             'Union Women and Child Development MoS'],
  ['george-kurian',              'George Kurian',              'Union Minority Affairs MoS'],
  ['satish-chandra-dubey',       'Satish Chandra Dubey',       'Union Coal MoS'],
  ['ramdas-athawale',            'Ramdas Athawale',            'Union Social Justice MoS, RPI leader'],
  ['bl-verma',                   'B.L. Verma',                 'Union Development of North Eastern Region MoS'],
  ['bhupathi-raju-srinivasa-varma', 'Bhupathi Raju Srinivasa Varma', 'Union Shipping MoS'],
  ['raj-bhushan-choudhary',      'Raj Bhushan Choudhary',      'Union Jal Shakti MoS'],
  ['tokhan-sahu',                'Tokhan Sahu',                'Union Housing MoS'],
  ['shripad-yesso-naik',         'Shripad Yesso Naik',         'Union Statistics MoS'],
  ['nimuben-bambhaniya',         'Nimuben Bambhaniya',         'Union Fisheries MoS'],
  ['prataprao-jadhav',           'Prataprao Jadhav',           'Union Ayush MoS'],
  ['murlidhar-mohol',            'Murlidhar Mohol',            'Union Civil Aviation MoS'],
  ['bhagirath-choudhary',        'Bhagirath Choudhary',        'Union Agriculture MoS'],
  ['kirtivardhan-singh',         'Kirtivardhan Singh',         'Union External Affairs MoS'],
  ['pankaj-chaudhary',           'Pankaj Chaudhary',           'Union Finance MoS'],
  ['shantanu-thakur',            'Shantanu Thakur',            'Union Ports MoS, Matua community leader'],
];

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function generateHindiBio(slug, name, role) {
  const res = await fetch(`${OPENAI_BASE}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a political biography writer. Write accurate, factual, concise Hindi biographies of Indian politicians based on your knowledge. Use natural Hindi. Keep proper nouns like party names (BJP, Congress, NDA), place names, and the politician\'s own name in their standard Hindi form. Output only the biography text — no headings, no bullet points, no English.',
        },
        {
          role: 'user',
          content: `${name} (${role}) के बारे में 100-130 शब्दों में एक संक्षिप्त जीवन परिचय हिंदी में लिखिए। इसमें उनकी शैक्षिक पृष्ठभूमि, राजनीतिक कैरियर की मुख्य उपलब्धियाँ और वर्तमान भूमिका शामिल करें।`,
        },
      ],
      max_tokens: 350,
      temperature: 0.3,
    }),
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || '';
}

async function processBatch(batch, results) {
  await Promise.all(batch.map(async ([slug, name, role]) => {
    try {
      const bio = await generateHindiBio(slug, name, role);
      results[slug] = bio;
      const preview = bio.slice(0, 70).replace(/\n/g, ' ');
      console.log(`  ✓ ${slug}: ${preview}…`);
    } catch (e) {
      console.log(`  ⚠ ${slug}: error — ${e.message}`);
      results[slug] = '';
    }
  }));
}

async function main() {
  if (!OPENAI_KEY) { console.error('❌ No OPENAI_API_KEY in env'); process.exit(1); }

  const results = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {};
  const todo = MINISTERS.filter(([slug]) => !results[slug] || results[slug] === '');
  const done = MINISTERS.length - todo.length;
  console.log(`${MINISTERS.length} ministers — ${done} cached, ${todo.length} to generate\n`);

  for (let i = 0; i < todo.length; i += CONCURRENCY) {
    const batch = todo.slice(i, i + CONCURRENCY);
    const batchNum = Math.floor(i / CONCURRENCY) + 1;
    const totalBatches = Math.ceil(todo.length / CONCURRENCY);
    console.log(`Batch ${batchNum}/${totalBatches}:`);
    await processBatch(batch, results);
    fs.writeFileSync(OUT, JSON.stringify(results, null, 2));
    if (i + CONCURRENCY < todo.length) await sleep(500);
  }

  const filled = Object.values(results).filter(v => v).length;
  console.log(`\n✅ Done — ${filled}/${MINISTERS.length} bios in ${OUT}`);
}

main().catch(console.error);
