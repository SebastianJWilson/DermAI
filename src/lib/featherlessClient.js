const BASE_URL = import.meta.env.VITE_FEATHERLESS_BASE_URL
const API_KEY = import.meta.env.VITE_FEATHERLESS_API_KEY
const VISION_MODEL = import.meta.env.VITE_FEATHERLESS_VISION_MODEL
const TEXT_MODEL = import.meta.env.VITE_FEATHERLESS_TEXT_MODEL

function stripMarkdownFences(text) {
  return text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim()
}

async function callFeatherless(payload, attempt = 1) {
  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText)
    if (attempt < 2) {
      return callFeatherless(payload, attempt + 1)
    }
    throw new Error(`Featherless API error ${res.status}: ${errText}`)
  }

  const data = await res.json()
  const content = data.choices?.[0]?.message?.content ?? ''
  const cleaned = stripMarkdownFences(content)

  try {
    return JSON.parse(cleaned)
  } catch {
    if (attempt < 2) {
      return callFeatherless(payload, attempt + 1)
    }
    throw new Error(`Failed to parse Featherless response as JSON: ${cleaned.slice(0, 200)}`)
  }
}

/**
 * Step 1 — Vision diagnosis
 * @param {{ imageBase64: string, mediaType: string, demographics: object, caseTitle: string }}
 * @returns {{ conditions: Array<{ rank, name, confidence }> }}
 */
export async function diagnoseSkin({ imageBase64, mediaType = 'image/jpeg', demographics, caseTitle }) {
  const { age, weight_kg, skin_type, location, race_ethnicity, biological_sex } = demographics

  const userPrompt = `Analyze the skin condition visible in this image. The patient's information is:
- Age: ${age ?? 'unknown'}
- Weight: ${weight_kg ? `${weight_kg} kg` : 'unknown'}
- Skin type: ${skin_type ?? 'unknown'}
- Location: ${location ?? 'unknown'}
- Race/Ethnicity: ${race_ethnicity ?? 'not specified'}
- Biological sex: ${biological_sex ?? 'unknown'}
- Patient's description: "${caseTitle}"

Return your analysis as a JSON object in exactly this format:
{
  "conditions": [
    { "rank": 1, "name": "<condition name>", "confidence": <0.00-1.00> },
    { "rank": 2, "name": "<condition name>", "confidence": <0.00-1.00> },
    { "rank": 3, "name": "<condition name>", "confidence": <0.00-1.00> },
    { "rank": 4, "name": "<condition name>", "confidence": <0.00-1.00> },
    { "rank": 5, "name": "<condition name>", "confidence": <0.00-1.00> }
  ]
}

Confidence values reflect relative likelihood given visual and demographic context.
Return exactly 5 conditions. Do not include any text outside the JSON object.`

  const payload = {
    model: VISION_MODEL,
    messages: [
      {
        role: 'system',
        content:
          'You are a dermatological AI assistant trained to analyze skin photos and suggest potential conditions for educational purposes. You are not a licensed medical professional and do not provide diagnoses. Always respond with valid JSON only — no preamble, no markdown code fences, no trailing text.',
      },
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: `data:${mediaType};base64,${imageBase64}` },
          },
          { type: 'text', text: userPrompt },
        ],
      },
    ],
    temperature: 0.2,
    max_tokens: 512,
  }

  return callFeatherless(payload)
}

/**
 * Step 3 — Review synthesis & product ranking
 * @param {{ rawProductsAndReviews: object, condition: string }}
 * @returns {Array<RankedProduct>}
 */
export async function rankProducts({ rawProductsAndReviews, condition }) {
  const userPrompt = `Below is a JSON object containing skincare products and their collected review data for the condition: "${condition}".

${JSON.stringify(rawProductsAndReviews)}

Analyze the review data for each product. Consider:
1. Overall customer sentiment (positive vs. negative experiences)
2. Effectiveness specifically for "${condition}"
3. Review consistency (avoid polarizing products; favor consistent praise)
4. Review volume (more reviews = more reliable signal)

Return ONLY a ranked JSON array ordered from best (#1) to lowest.
No text outside the JSON:
[
  {
    "rank": 1,
    "product_id": "<id from input>",
    "name": "<product name>",
    "brand": "<brand name>",
    "description": "<one sentence description>",
    "url": "<url or null>",
    "review_summary": "<2-3 sentence synthesis of why this product ranked here>",
    "sentiment_score": <float 0.0-1.0>,
    "review_count": <integer or null>,
    "ranking_rationale": "<one sentence comparing this product to its competitors>"
  }
]

Include every product from the input. Do not omit any.`

  const payload = {
    model: TEXT_MODEL,
    messages: [
      {
        role: 'system',
        content:
          'You are a product analyst specializing in skincare. You read collected review data for multiple products and rank them objectively based on sentiment quality, review volume, and relevance to a specific skin condition. Respond with valid JSON only — no preamble, no markdown code fences, no trailing text.',
      },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.2,
    max_tokens: 2048,
  }

  return callFeatherless(payload)
}
