const BASE_URL = import.meta.env.VITE_TINYFISH_BASE_URL
const API_KEY = import.meta.env.VITE_TINYFISH_API_KEY

function stripMarkdownFences(text) {
  return text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim()
}

async function callTinyfish(body, attempt = 1) {
  const res = await fetch(`${BASE_URL}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText)
    if (attempt < 2) {
      return callTinyfish(body, attempt + 1)
    }
    throw new Error(`Tinyfish API error ${res.status}: ${errText}`)
  }

  const data = await res.json()

  // Tinyfish may return the result directly as JSON, or nested in a message field.
  // Handle both shapes.
  let content = data
  if (typeof data === 'string') {
    content = data
  } else if (data?.choices?.[0]?.message?.content) {
    content = data.choices[0].message.content
  } else if (data?.result) {
    content = data.result
  } else if (data?.output) {
    content = data.output
  }

  if (typeof content === 'object') {
    return content
  }

  const cleaned = stripMarkdownFences(String(content))

  try {
    return JSON.parse(cleaned)
  } catch {
    if (attempt < 2) {
      return callTinyfish(body, attempt + 1)
    }
    throw new Error(`Failed to parse Tinyfish response as JSON: ${cleaned.slice(0, 200)}`)
  }
}

/**
 * Step 2 — Combined product + review data collection
 * @param {{ condition: string }}
 * @returns {{ condition: string, products: Array<Product> }}
 */
export async function findProductsAndReviews({ condition }) {
  const prompt = `You are a skincare research assistant with web search access. Perform the following two-part research task and return ONLY a JSON object.
No preamble, no markdown fences, no text outside the JSON.

Condition to research: "${condition}"

Part 1: Search for 5 to 10 over-the-counter skincare products commonly recommended for treating or improving "${condition}".

Part 2: For each product found, search for customer reviews across major retail sites (Amazon, Sephora, Ulta, the brand's own website, etc.). Collect as much review data as possible: overall sentiment, notable customer comments, average ratings, and review counts.

Return ONLY this JSON structure:
{
  "condition": "${condition}",
  "products": [
    {
      "id": "prod_001",
      "name": "<product name>",
      "brand": "<brand name>",
      "description": "<one sentence about what it does for this condition>",
      "url": "<direct product URL or null>",
      "reviews": {
        "raw_summary": "<paragraph combining collected review quotes, common themes, and overall sentiment>",
        "average_rating": <float 1.0-5.0 or null>,
        "review_count": <integer or null>
      }
    }
  ]
}

Minimum 5 products, maximum 10. Do not include any text outside the JSON object.`

  return callTinyfish({ prompt, condition })
}
