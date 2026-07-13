// Gemini AI integration — Vision + Text + Freshness

// Using the 2026 free-tier compatible models!
const MODELS = [
  'gemini-flash-lite-latest',
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash-lite'
];

function getModelUrl(model) {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
}

function headers() {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey === 'PASTE_YOUR_API_KEY_HERE') {
    throw new Error('Gemini API Key is missing. Please paste it in the .env file.');
  }
  return { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey };
}

function extractJSON(text) {
  try {
    // Step 1: Strip markdown code fences
    let clean = text
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    // Step 2: Find the outermost JSON array or object
    const startArr = clean.indexOf('[');
    const startObj = clean.indexOf('{');
    let jsonStr = clean;

    if (startArr !== -1 && (startObj === -1 || startArr < startObj)) {
      const endArr = clean.lastIndexOf(']');
      jsonStr = clean.slice(startArr, endArr + 1);
    } else if (startObj !== -1) {
      const endObj = clean.lastIndexOf('}');
      jsonStr = clean.slice(startObj, endObj + 1);
    }

    // Step 3: Remove trailing commas before } or ] (invalid JSON)
    jsonStr = jsonStr.replace(/,\s*([}\]])/g, '$1');

    return JSON.parse(jsonStr);
  } catch (e) {
    console.error('[extractJSON] Failed to parse:', text?.slice(0, 300));
    throw new Error('Failed to parse AI response as JSON. Please try again.');
  }
}

async function callGemini(apiKey, parts) {
  let lastError = null;
  for (const model of MODELS) {
    try {
      const res = await fetch(getModelUrl(model), {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: { 
            temperature: 0.4, 
            maxOutputTokens: 3000,
            responseMimeType: "application/json" // Force strict JSON!
          },
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        const msg = err?.error?.message || `API error ${res.status}`;
        lastError = new Error(msg);
        console.warn(`[Gemini Fallback] ${model} failed:`, msg);
        continue;
      }
      const data = await res.json();
      return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } catch (e) {
      lastError = e;
      continue;
    }
  }
  throw lastError || new Error('No working Gemini model found for your API key');
}

// Convert file to base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ── 1. FRIDGE / PANTRY IMAGE SCANNER ──────────────────────────────────────

export async function scanFridgeImage(apiKey, imageFile, today) {
  const base64 = await fileToBase64(imageFile);
  const mimeType = imageFile.type || 'image/jpeg';

  const prompt = `You are an AI food inventory assistant. Analyze this image of a fridge, pantry, or kitchen.

Identify ALL visible food items and grocery products. For each item:
- Estimate quantity and unit
- Categorize it (vegetables, fruits, dairy, grains, protein, spices, beverages, packaged, leftovers, snacks)
- Analyze visual freshness specifically for fresh produce, dairy, and leftovers.
- Suggest best storage location (fridge, freezer, pantry, counter)
- Estimate shelf life in days from today (${today}) considering Indian climate
- IMPORTANT OCR TASK: Carefully read any printed text on packaged goods to find Expiry Dates (EXP, Use By, Best Before) or Manufacturing Dates (MFD, PKD). If you find a printed date, use it to accurately calculate the \`expiryDate\`!

Return a JSON array:
[
  {
    "name": "Palak (Spinach)",
    "category": "vegetables",
    "quantity": 1,
    "unit": "bunch",
    "storageLocation": "fridge",
    "expiryDate": "YYYY-MM-DD",
    "purchaseDate": "${today}",
    "estimatedShelfLifeDays": 3,
    "confidence": "high",
    "freshness": "SEMI-FRESH", 
    "freshnessReason": "Leaves are slightly wilted but still usable"
  }
]

For "freshness", use strictly one of these values: "FRESH", "SEMI-FRESH", "SPOILED", or "N/A" (for packaged/dry goods).
Include ALL visible items. Return ONLY a valid JSON array.`;

  const text = await callGemini(apiKey, [
    { inlineData: { mimeType, data: base64 } },
    { text: prompt },
  ]);

  return extractJSON(text);
}

// ── 2. FOOD FRESHNESS DETECTOR ─────────────────────────────────────────────

export async function analyzeFoodFreshness(apiKey, imageFile, foodName = '') {
  const base64 = await fileToBase64(imageFile);
  const mimeType = imageFile.type || 'image/jpeg';

  const prompt = `You are an expert food freshness analyzer. Analyze the visual freshness of ALL the food items in this image.
${foodName ? `Focus on: ${foodName}, but analyze everything.` : 'Identify and analyze every food item in the image.'}

Examine visual indicators for EACH item:
- Color (vibrant vs dull/brown/yellow/moldy)
- Texture (firm vs soft/mushy/wrinkled)  
- Surface condition (smooth vs mold/dark spots/slime)
- Overall appearance

Return a JSON array with an object for EACH item found:
[
  {
    "foodName": "Banana",
    "freshnessLevel": "SPOILED",
    "freshnessScore": 0,
    "confidence": "high",
    "indicators": [
      {"factor": "Color", "observation": "Completely brown and black", "positive": false},
      {"factor": "Surface", "observation": "White mold patches visible", "positive": false}
    ],
    "action": "DISCARD",
    "estimatedDaysLeft": 0,
    "tips": "Do not eat. The mold indicates severe spoilage. Recommended: Compost this or use as garden fertilizer.",
    "boundingBox": [ymin, xmin, ymax, xmax]
  }
]

IMPORTANT FOR BOUNDING BOX:
- \`boundingBox\` must be an array of 4 integers: [ymin, xmin, ymax, xmax] scaled strictly from 0 to 1000.
- ymin is top, xmin is left, ymax is bottom, xmax is right. 
- It MUST bound the exact food item you are analyzing in this object.

freshnessLevel must be one of: FRESH, SEMI_FRESH, SPOILED
action must be one of: SAFE, USE_NOW, USE_TODAY, DISCARD, REPURPOSE

Return ONLY a valid JSON array. If items are spoiled, always suggest safe alternate uses like composting or fertilizer in the tips.`;

  const text = await callGemini(apiKey, [
    { inlineData: { mimeType, data: base64 } },
    { text: prompt },
  ]);

  return extractJSON(text);
}

// ── 3. RECIPE SUGGESTIONS ──────────────────────────────────────────────────

export async function getRecipeSuggestions(apiKey, inventory, healthProfile = '') {
  const active = inventory.filter(i => !i.isUsed && !i.isWasted);
  const urgent = active.filter(i => i.status === 'urgent' || i.status === 'warning');
  const fresh = active.filter(i => i.status === 'fresh');

  const urgentList = urgent.map(i => `[${i.status.toUpperCase()}] ${i.name} (${i.quantity} ${i.unit})`).join('\n');
  const freshList = fresh.slice(0, 10).map(i => `${i.name} (${i.quantity} ${i.unit})`).join('\n');

  const healthRule = healthProfile 
    ? `\nCRITICAL MEDICAL & DIETARY RULES:\n- MUST STRICTLY FOLLOW THIS USER PROFILE: ${healthProfile}\n- DO NOT suggest ANY recipe that violates these rules.` 
    : '';

  const prompt = `You are a home cooking expert and clinical nutritionist for Indian households. 

Available ingredients — PRIORITIZE URGENT/WARNING items:
URGENT/WARNING (MUST use soon):
${urgentList || 'None'}

Other available:
${freshList || 'None'}
${healthRule}
Generate 4 practical Indian home recipes that use the urgent items.${healthRule ? ' ENSURE RECIPES ARE 100% SAFE FOR THE MEDICAL RULES.' : ''} Mix of: quick meals, dal/sabzi, breakfast, snacks.

Return JSON array:
[
  {
    "name": "Palak Paneer",
    "description": "Creamy spinach curry with cottage cheese",
    "cookTime": "25 mins",
    "difficulty": "Easy",
    "serves": 3,
    "urgentIngredients": ["Palak", "Paneer"],
    "allIngredients": [
      {"name": "Palak", "quantity": "1 bunch", "fromPantry": true},
      {"name": "Paneer", "quantity": "200g", "fromPantry": true},
      {"name": "Onion", "quantity": "1", "fromPantry": false}
    ],
    "steps": ["Step 1...", "Step 2..."],
    "wastesSaved": 2,
    "emoji": "🥬"
  }
]

Return ONLY valid JSON array.`;

  const text = await callGemini(apiKey, [{ text: prompt }]);
  return extractJSON(text);
}

// ── 4. NATURAL LANGUAGE FOOD PARSER ────────────────────────────────────────

export async function parseFoodInput(apiKey, userText, today) {
  const prompt = `Parse this Indian household grocery input into structured items:
"${userText}"

Today: ${today}

For each item return:
- name (English with Hindi in brackets if applicable)
- category: vegetables/fruits/dairy/grains/protein/spices/beverages/packaged/leftovers/snacks
- quantity (number)
- unit: piece/kg/grams/litre/ml/bunch/packet/bottle/bowl/cup/dozen
- storageLocation: fridge/freezer/pantry/counter
- expiryDate: YYYY-MM-DD (estimated from today for Indian climate)
- purchaseDate: "${today}"

Examples: "2kg aloo" → potato 2kg pantry, "1L doodh" → milk 1 litre fridge

Return ONLY a JSON array. Support Hindi/English/Hinglish input.`;

  const text = await callGemini(apiKey, [{ text: prompt }]);
  return extractJSON(text);
}

// ── 5. SHELF LIFE ESTIMATION ───────────────────────────────────────────────

export async function estimateShelfLife(apiKey, itemName, storageLocation) {
  const prompt = `Estimate shelf life in days for "${itemName}" in ${storageLocation} in Indian household (warm/humid climate).

Return JSON:
{
  "shelfLifeDays": 5,
  "category": "vegetables",
  "storageAdvice": "Store in airtight container",
  "confidence": "high"
}

Return ONLY valid JSON.`;

  const text = await callGemini(apiKey, [{ text: prompt }]);
  return extractJSON(text);
}

// ── 6. HEALTH & DIETARY IMPACT ANALYZER ────────────────────────────────────

export async function analyzeHealthImpact(apiKey, inventory, healthProfile) {
  const itemList = inventory.map(i => i.name).join(', ');
  
  const prompt = `You are an expert clinical nutritionist and dietician. 
The user has provided the following free-text medical/dietary profile:
"${healthProfile || 'None'}"

Their current pantry contains: ${itemList || 'Nothing currently'}

1. Identify items currently in their pantry that are exceptionally GOOD or BAD for their specific profile. Flag bad items with "AVOID" and good items with "GOOD".
2. Recommend 3 specific grocery items they SHOULD buy on their next trip to actively support their goals or condition.
3. Provide a brief 2-sentence general dietary advice tailored to their profile.

Return a JSON object:
{
  "pantryFlags": [
    { "itemName": "Sugar", "status": "AVOID", "reason": "Spikes blood glucose, dangerous for diabetes." },
    { "itemName": "Spinach", "status": "GOOD", "reason": "High in fiber and low GI." }
  ],
  "shoppingRecommendations": [
    { "itemName": "Quinoa", "benefit": "Low glycemic index alternative to white rice." }
  ],
  "generalAdvice": "Focus on complex carbs and fiber. Avoid hidden sugars in packaged foods."
}

Return ONLY a valid JSON object.`;

  const text = await callGemini(apiKey, [{ text: prompt }]);
  return extractJSON(text);
}
