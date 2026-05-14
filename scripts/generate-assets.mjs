#!/usr/bin/env node
// Run once to generate all game art: node scripts/generate-assets.mjs
// Assets saved to public/assets/ — committed and served as static files forever

import { fal } from '@fal-ai/client';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

// Load .env manually (no dotenv dependency needed)
const envPath = path.join(ROOT, '.env');
const envContent = readFileSync(envPath, 'utf8');
const FAL_KEY = envContent.match(/FAL_API_KEY=(.+)/)?.[1]?.trim();

if (!FAL_KEY) { console.error('FAL_API_KEY not found in .env'); process.exit(1); }

fal.config({ credentials: FAL_KEY });

const SCENE_STYLE = 'British illustrated game art, warm earthy palette, rich detailed environment, flat design with depth and shading, slightly vintage editorial illustration, cinematic composition, no text, no UI elements, no watermarks, high quality game background art';
const CHAR_STYLE  = 'British character portrait illustration, warm earthy palette, half-body shot, plain neutral warm background, expressive detailed face, editorial illustration style, game character art, no text, no watermarks';
const PROP_STYLE  = 'British illustrated prop, warm palette, clean illustration, detailed, isolated on plain white background, no text, no shadows, game asset art';
const AVATAR_STYLE = 'game character creation portrait, illustrated, bust shot, plain light background, friendly expression, diverse, clean illustration style, no text';

const assets = [

  // ── SCENE BACKGROUNDS (landscape 16:9) ──────────────────────────────────

  { dir: 'scenes', name: 'heathrow_arrivals', size: 'landscape_16_9',
    prompt: `${SCENE_STYLE}, Heathrow Terminal 5 arrivals hall interior, modern British airport, large arrivals board, warm overhead lighting, diverse crowd with welcome signs, sense of excitement and arrival` },

  { dir: 'scenes', name: 'taxi_interior', size: 'landscape_16_9',
    prompt: `${SCENE_STYLE}, interior of a classic London black cab viewed from the back seat, front seats and headrests visible, large rain-speckled windows, London street outside with red double-decker bus, Big Ben faintly visible in background, grey overcast British sky, first-person cinematic perspective` },

  { dir: 'scenes', name: 'london_streets_bg', size: 'landscape_16_9',
    prompt: `${SCENE_STYLE}, London street scene background layer, Georgian and Victorian terraced houses, shop fronts, red phone box, slightly overcast British day, horizontal panorama for scrolling, no foreground elements, depth and atmosphere` },

  { dir: 'scenes', name: 'london_streets_fg', size: 'landscape_16_9',
    prompt: `${SCENE_STYLE}, London street foreground layer, close-up iron railings, Victorian lamp posts, brick pavement details, UK street furniture, slight blur for depth-of-field, horizontal composition for parallax overlay` },

  { dir: 'scenes', name: 'cafe_exterior', size: 'landscape_16_9',
    prompt: `${SCENE_STYLE}, traditional British greasy spoon cafe exterior, hand-painted sign above door, steamed-up window, British street, slightly worn, welcoming warm glow from inside, grey London sky above` },

  { dir: 'scenes', name: 'cafe_interior', size: 'landscape_16_9',
    prompt: `${SCENE_STYLE}, cosy British greasy spoon cafe interior, worn formica tables with sauce bottles and napkin holders, full English breakfast on nearest table with bacon eggs sausages beans toast, tea urn steaming behind counter, old radio on shelf, faded Union Jack, fluorescent and warm lighting, authentic East End caff atmosphere` },

  { dir: 'scenes', name: 'pub_exterior', size: 'landscape_16_9',
    prompt: `${SCENE_STYLE}, traditional British pub exterior, The Crown pub sign, hanging flower baskets, chalkboard menu outside, frosted glass windows with warm glow inside, British street, classic London local` },

  { dir: 'scenes', name: 'pub_interior', size: 'landscape_16_9',
    prompt: `${SCENE_STYLE}, traditional British pub interior, dark wood bar with multiple real ale beer taps, brewery mirror advertisements, horse brasses on beams, worn carpet, fruit machine glowing, dartboard on far wall, warm amber lighting, locals at the bar, quintessential British local` },

  { dir: 'scenes', name: 'tube_carriage', size: 'landscape_16_9',
    prompt: `${SCENE_STYLE}, London Underground Piccadilly line tube carriage interior, distinctive moquette patterned seats, overhead yellow grab handles, London Underground map strip above windows, LED destination board showing Piccadilly Line Heathrow, black tunnel visible through windows, authentic TfL atmosphere, commuters seated` },

  { dir: 'scenes', name: 'tube_platform', size: 'landscape_16_9',
    prompt: `${SCENE_STYLE}, London Underground station platform, distinctive tiled walls, yellow line at platform edge, destination board, tunnel entrance, warm strip lighting, London Underground roundel signage, slight atmospheric haze` },

  { dir: 'scenes', name: 'plane_window_clouds', size: 'landscape_16_9',
    prompt: `${SCENE_STYLE}, view from airplane window seat, aircraft wing clearly visible, vast beautiful cloudscape below, golden afternoon light breaking through clouds, blue sky above, cinematic and beautiful, sense of journey and anticipation` },

  { dir: 'scenes', name: 'plane_descent_london', size: 'landscape_16_9',
    prompt: `${SCENE_STYLE}, aerial view of London from descending aircraft, Thames river snaking through cityscape, Big Ben and Houses of Parliament visible, London Eye, Tower Bridge, The Shard, city stretching to horizon, overcast British sky, beautiful cinematic bird's-eye perspective` },

  // ── CHARACTERS (portrait 4:3) ───────────────────────────────────────────

  { dir: 'characters', name: 'billy_neutral', size: 'portrait_4_3',
    prompt: `${CHAR_STYLE}, Billy, British Cockney man aged 32, dark messy hair, short stubble, wearing black leather jacket over grey t-shirt, friendly cheeky expression, mouth closed slight smirk, confident East London energy` },

  { dir: 'characters', name: 'billy_talking', size: 'portrait_4_3',
    prompt: `${CHAR_STYLE}, Billy, British Cockney man aged 32, dark messy hair, short stubble, black leather jacket, mid-sentence mouth open talking animatedly, engaged and friendly expression` },

  { dir: 'characters', name: 'billy_laughing', size: 'portrait_4_3',
    prompt: `${CHAR_STYLE}, Billy, British Cockney man aged 32, dark messy hair, short stubble, black leather jacket, big genuine laugh, mouth wide open, eyes crinkled with amusement` },

  { dir: 'characters', name: 'billy_concerned', size: 'portrait_4_3',
    prompt: `${CHAR_STYLE}, Billy, British Cockney man aged 32, dark messy hair, short stubble, black leather jacket, concerned worried expression, eyebrows raised, slightly open mouth, protective East End mate energy` },

  { dir: 'characters', name: 'brenda_neutral', size: 'portrait_4_3',
    prompt: `${CHAR_STYLE}, Brenda, British East End woman aged 58, grey curly hair, reading glasses pushed up on forehead, white cafe apron, warm no-nonsense face, neutral closed mouth expression, behind cafe counter, salt-of-the-earth greasy spoon owner` },

  { dir: 'characters', name: 'brenda_talking', size: 'portrait_4_3',
    prompt: `${CHAR_STYLE}, Brenda, British East End woman aged 58, grey curly hair, glasses on forehead, white cafe apron, talking animatedly mouth open, warm and direct, behind cafe counter` },

  { dir: 'characters', name: 'brenda_stern', size: 'portrait_4_3',
    prompt: `${CHAR_STYLE}, Brenda, British East End woman aged 58, grey curly hair, glasses on forehead, white cafe apron, stern unimpressed expression, arms folded, East End matriarch energy, not suffering fools` },

  { dir: 'characters', name: 'terry_neutral', size: 'portrait_4_3',
    prompt: `${CHAR_STYLE}, Terry, British pub landlord aged 55, receding salt-and-pepper hair, weathered friendly face, pub landlord apron over checked shirt, neutral gruff closed-mouth expression, behind bar with beer taps visible, traditional British publican` },

  { dir: 'characters', name: 'terry_talking', size: 'portrait_4_3',
    prompt: `${CHAR_STYLE}, Terry, British pub landlord aged 55, receding salt-and-pepper hair, weathered face, pub apron over checked shirt, talking mid-sentence mouth open, gesturing, behind bar, storytelling mode` },

  { dir: 'characters', name: 'terry_suspicious', size: 'portrait_4_3',
    prompt: `${CHAR_STYLE}, Terry, British pub landlord aged 55, receding salt-and-pepper hair, weathered face, pub apron, eyes narrowed in deep suspicion, sizing up a stranger, classic British publican scrutiny` },

  // ── PROPS ───────────────────────────────────────────────────────────────

  { dir: 'props', name: 'full_english', size: 'square_hd',
    prompt: `${PROP_STYLE}, classic British full English breakfast, white oval plate, back bacon rashers, thick pork sausages, baked beans, fried egg sunny side up, halved grilled tomato, flat mushrooms, slice of black pudding, two slices of buttered toast, beautiful detailed food illustration, top-down perspective` },

  { dir: 'props', name: 'pint_beer', size: 'square_hd',
    prompt: `${PROP_STYLE}, British pint of real ale, straight imperial pint glass, golden amber beer, thick creamy white head, slight condensation on glass, pump clip on beer mat, warm pub lighting` },

  { dir: 'props', name: 'cup_of_tea', size: 'square_hd',
    prompt: `${PROP_STYLE}, classic British mug of builders tea, ceramic mug, strong dark amber tea colour, gentle steam rising, small teaspoon resting on saucer, biscuit on the side` },

  { dir: 'props', name: 'arrival_sign', size: 'square_hd',
    prompt: `${PROP_STYLE}, hand-held cardboard airport arrival sign, black marker handwriting, slightly misspelled name written large, cardboard sign, airport arrivals context, slightly crumpled edges, authentic and endearing` },

  { dir: 'props', name: 'evening_standard', size: 'landscape_4_3',
    prompt: `${PROP_STYLE}, Evening Standard newspaper front page layout, classic British tabloid newspaper design, masthead at top, large headline area, photo space, clean editorial newspaper design, blank content areas for text overlay` },

  // ── PLAYER AVATARS ──────────────────────────────────────────────────────

  { dir: 'avatars', name: 'avatar_01', size: 'square_hd',
    prompt: `${AVATAR_STYLE}, young woman early 20s, casual tourist style, backpack strap visible, warm smile, fair skin, brown hair` },

  { dir: 'avatars', name: 'avatar_02', size: 'square_hd',
    prompt: `${AVATAR_STYLE}, young man mid 20s, casual traveller, t-shirt and jacket, friendly expression, medium skin, dark curly hair` },

  { dir: 'avatars', name: 'avatar_03', size: 'square_hd',
    prompt: `${AVATAR_STYLE}, woman early 30s, smart casual, blazer, professional look, warm smile, light brown hair, light skin` },

  { dir: 'avatars', name: 'avatar_04', size: 'square_hd',
    prompt: `${AVATAR_STYLE}, man early 30s, relaxed style, open collar shirt, easy-going expression, medium skin tone, short dark hair` },

  { dir: 'avatars', name: 'avatar_05', size: 'square_hd',
    prompt: `${AVATAR_STYLE}, young woman mid 20s, South Asian appearance, bright colourful top, warm bright smile, dark hair` },

  { dir: 'avatars', name: 'avatar_06', size: 'square_hd',
    prompt: `${AVATAR_STYLE}, young man early 20s, Black British appearance, stylish hoodie, cool confident expression, short natural hair` },

  { dir: 'avatars', name: 'avatar_07', size: 'square_hd',
    prompt: `${AVATAR_STYLE}, woman late 30s, Latin American appearance, colourful blouse, warm expressive face, dark wavy hair` },

  { dir: 'avatars', name: 'avatar_08', size: 'square_hd',
    prompt: `${AVATAR_STYLE}, man 40s, European appearance, glasses, thoughtful kind expression, smart casual shirt, slightly greying temples` },

  { dir: 'avatars', name: 'avatar_09', size: 'square_hd',
    prompt: `${AVATAR_STYLE}, young woman early 20s, East Asian appearance, modern style, cheerful bright expression, straight dark hair` },

  { dir: 'avatars', name: 'avatar_10', size: 'square_hd',
    prompt: `${AVATAR_STYLE}, older man 50s, distinguished appearance, well-dressed collared shirt, warm confident smile, silver hair` },

  // ── NEW CHARACTERS ──────────────────────────────────────────────────────

  { name: 'jess_neutral',  dir: 'characters', w: 768, h: 1024, prompt: 'Photorealistic portrait of a British-Asian woman in her late 20s, short dark hair styled neatly, wearing smart casual clothing, confident intelligent expression with a slight warm smirk, South Bank London background softly blurred, cinematic lighting, professional digital painting, warm tones, shallow depth of field, film grain' },
  { name: 'jess_talking',  dir: 'characters', w: 768, h: 1024, prompt: 'Photorealistic portrait of a British-Asian woman in her late 20s, short dark hair, smart casual, speaking mid-sentence, slightly animated expression, South Bank London background softly blurred, cinematic lighting, professional digital painting, warm tones' },
  { name: 'marcus_neutral', dir: 'characters', w: 768, h: 1024, prompt: 'Photorealistic portrait of a young British-Nigerian man, late 20s, broad warm grin, headphones hanging around neck, casual streetwear hoodie, King\'s Cross station background softly blurred, cinematic lighting, energetic and confident, professional digital painting, film grain' },
  { name: 'marcus_talking', dir: 'characters', w: 768, h: 1024, prompt: 'Photorealistic portrait of a young British-Nigerian man, late 20s, talking enthusiastically, headphones around neck, casual hoodie, mid-conversation big smile, King\'s Cross background blurred, cinematic warm lighting, professional digital painting' },
  { name: 'edward_neutral', dir: 'characters', w: 768, h: 1024, prompt: 'Photorealistic portrait of a distinguished British man, mid-50s, silver-grey temples, well-groomed, wearing a smart checked shirt, slight amused expression, Notting Hill street background softly blurred, cinematic lighting, refined and distinguished, professional digital painting, warm afternoon light' },
  { name: 'edward_talking', dir: 'characters', w: 768, h: 1024, prompt: 'Photorealistic portrait of a distinguished British man, mid-50s, grey temples, checked shirt, speaking with measured expression, slight eyebrow raised, Notting Hill background blurred, cinematic lighting, professional digital painting, warm tones' },
  { name: 'brad_neutral',  dir: 'characters', w: 768, h: 1024, prompt: 'Photorealistic portrait of an American man, early 30s, tech casual attire, slightly confused but friendly expression, messy casual hair, Camden Market background softly blurred, cinematic lighting, approachable and slightly bewildered, professional digital painting, natural tones' },
  { name: 'brad_talking',  dir: 'characters', w: 768, h: 1024, prompt: 'Photorealistic portrait of an American man, early 30s, tech casual, animated mid-speech expression, self-deprecating smile, Camden Market background blurred, cinematic warm lighting, professional digital painting' },

  // ── NEW SCENES ──────────────────────────────────────────────────────────

  { name: 'south_bank',     dir: 'scenes', w: 1344, h: 768, prompt: 'London South Bank riverside at golden hour, Thames in background, Tate Modern visible, people walking along the embankment, atmospheric hazy light, cinematic widescreen, photorealistic, warm golden tones, slight lens flare, architectural beauty' },
  { name: 'kings_cross',    dir: 'scenes', w: 1344, h: 768, prompt: 'Interior of King\'s Cross St Pancras train station, London, the magnificent Victorian iron-and-glass roof arching overhead, commuters below, dramatic shafts of light from above, cinematic widescreen, photorealistic, warm atmospheric lighting, grand architecture' },
  { name: 'notting_hill',   dir: 'scenes', w: 1344, h: 768, prompt: 'Portobello Road Notting Hill London, colourful Victorian terraced houses, market stalls with vintage items, dappled sunlight through trees, charming and vibrant, cinematic widescreen, photorealistic, warm afternoon light, beautiful English architecture' },
  { name: 'camden_market',  dir: 'scenes', w: 1344, h: 768, prompt: 'Camden Market London, vibrant eclectic market stalls, colourful alternative fashion and food, canal visible in background, energetic crowd, cinematic widescreen, photorealistic, vivid colours, atmospheric overcast London light' },
];

async function downloadImage(url, filepath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.statusText}`);
  const buffer = await res.arrayBuffer();
  await fs.writeFile(filepath, Buffer.from(buffer));
}

async function generateAsset(asset, index, total) {
  const outPath = path.join(ROOT, 'public', 'assets', asset.dir, `${asset.name}.png`);

  // Skip if already generated
  try {
    await fs.access(outPath);
    console.log(`[${index}/${total}] SKIP  ${asset.dir}/${asset.name} (already exists)`);
    return;
  } catch {}

  console.log(`[${index}/${total}] GEN   ${asset.dir}/${asset.name}...`);

  try {
    const result = await fal.subscribe('fal-ai/flux-pro/v1.1', {
      input: {
        prompt: asset.prompt,
        image_size: asset.size,
        num_inference_steps: 28,
        guidance_scale: 3.5,
        num_images: 1,
        output_format: 'png',
        enable_safety_checker: false,
      },
      logs: false,
    });

    const imageUrl = result.data.images[0].url;
    await downloadImage(imageUrl, outPath);
    console.log(`[${index}/${total}] DONE  ${asset.dir}/${asset.name}`);
  } catch (err) {
    console.error(`[${index}/${total}] FAIL  ${asset.dir}/${asset.name}: ${err.message}`);
  }
}

async function main() {
  console.log(`\nAlright Mate — Asset Generation`);
  console.log(`Generating ${assets.length} assets with FLUX Pro 1.1\n`);

  // Estimate cost
  const costs = { square_hd: 0.05, portrait_4_3: 0.05, landscape_16_9: 0.05, landscape_4_3: 0.05 };
  const total = assets.reduce((sum, a) => sum + (costs[a.size] || 0.05), 0);
  console.log(`Estimated cost: ~$${total.toFixed(2)}\n`);

  for (let i = 0; i < assets.length; i++) {
    await generateAsset(assets[i], i + 1, assets.length);
    // Small delay to be kind to the API
    if (i < assets.length - 1) await new Promise(r => setTimeout(r, 500));
  }

  console.log('\nAll assets generated. Run npm run build to include them.');
}

main().catch(console.error);
