/**
 * Supabase Edge Function: rank-products
 * ---------------------------------------
 * Replaces the Vercel /api/rank route.
 * Supabase Edge Functions have a 150s timeout vs Vercel Hobby's 10s — no more 504s.
 *
 * Reads FEATHERLESS_API_KEY, FEATHERLESS_BASE_URL, FEATHERLESS_TEXT_MODEL
 * from Supabase secrets (set via: supabase secrets set KEY=value)
 *
 * POST /functions/v1/rank-products
 * Body: { rawProductsAndReviews: object, condition: string }
 * Returns: Array of ranked products
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function stripMarkdownFences(text: string): string {
  return text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim()
}

function extractJson(text: string): string {
  const stripped = stripMarkdownFences(text)
  try { JSON.parse(stripped); return stripped } catch { /* continue */ }
  for (const open of ['{', '[']) {
    const start = stripped.lastIndexOf(open)
    if (start === -1) continue
    const close = open === '{' ? '}' : ']'
    let depth = 0
    for (let i = start; i < stripped.length; i++) {
      if (stripped[i] === open) depth++
      else if (stripped[i] === close) { depth--; if (depth === 0) return stripped.slice(start, i + 1) }
    }
  }
  return stripped
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { rawProductsAndReviews, condition } = await req.json()

    if (!rawProductsAndReviews || !condition) {
      return new Response(
        JSON.stringify({ error: 'rawProductsAndReviews and condition are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const BASE_URL   = Deno.env.get('FEATHERLESS_BASE_URL')!
    const API_KEY    = Deno.env.get('FEATHERLESS_API_KEY')!
    const TEXT_MODEL = Deno.env.get('FEATHERLESS_TEXT_MODEL')!

    // Trim payload — only send fields the LLM needs for ranking
    // Caps review text at 300 chars to keep prompt small and fast
    const trimmed = {
      condition,
      products: ((rawProductsAndReviews as any).products ?? []).map((p: any) => ({
        id:          p.id,
        name:        p.name,
        brand:       p.brand,
        description: p.description,
        url:         p.url,
        reviews: {
          raw_summary:    (p.reviews?.raw_summary ?? '').slice(0, 300),
          average_rating: p.reviews?.average_rating,
          review_count:   p.reviews?.review_count,
          recommend_rate: p.reviews?.recommend_rate,
        },
      })),
    }

    console.log('[rank-products] Ranking', trimmed.products.length, 'products for:', condition)

    const userPrompt = `/no_think\nBelow is a JSON object containing skincare products and their collected review data for the condition: "${condition}".

${JSON.stringify(trimmed)}

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
          content: 'You are a product analyst specializing in skincare. You read collected review data for multiple products and rank them objectively based on sentiment quality, review volume, and relevance to a specific skin condition. Respond with valid JSON only — no preamble, no markdown code fences, no trailing text.',
        },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.2,
      max_tokens: 4000,
      chat_template_kwargs: { enable_thinking: false },
    }

    const upstream = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(payload),
    })

    if (!upstream.ok) {
      const errText = await upstream.text().catch(() => upstream.statusText)
      console.error('[rank-products] Featherless error:', upstream.status, errText)
      return new Response(
        JSON.stringify({ error: errText }),
        { status: upstream.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const data = await upstream.json()
    const message = (data.choices?.[0]?.message) ?? {}
    const content = message.content || message.reasoning_content || message.reasoning || ''
    const cleaned = extractJson(content)
    const parsed  = JSON.parse(cleaned)

    console.log('[rank-products] Ranked', Array.isArray(parsed) ? parsed.length : '?', 'products')

    return new Response(
      JSON.stringify(parsed),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('[rank-products] Error:', err)
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
