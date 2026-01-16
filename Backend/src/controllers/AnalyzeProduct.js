import { GoogleGenAI } from "@google/genai";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export const AnalyzeProduct = async (req, res) => {
  try {
    const { description } = req.body;
    if (!description) return res.status(400).json({ error: "Missing product description" });

    // Phase 1: Semantic Expansion (high temperature)
    const phase1 = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      temperature: 0.85,
      contents: [
        {
          role: "system",
          parts: [
            {
              text: `
You are a semantic expansion AI. Take a vague product description and generate:
- multiple possible product interpretations
- potential target users
- inferred product functions
Output JSON like:
{
  "possible_product_interpretations": ["string"],
  "possible_target_users": ["string"],
  "possible_functions": ["string"],
  "assumptions": ["string"]
}`
            }
          ]
        },
        { role: "user", parts: [{ text: description }] }
      ]
    });
    const phase1Json = JSON.parse(phase1.candidates[0].content.parts[0].text);

    // Phase 2: Hypothesis Consolidation (medium temperature)
    const phase2 = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      temperature: 0.45,
      contents: [
        {
          role: "system",
          parts: [
            {
              text: `
You are a hypothesis consolidator. Take Phase1 JSON and:
- merge overlapping interpretations
- select dominant product definition
- identify primary & secondary users
- keep assumptions
Output JSON like:
{
  "dominant_product_definition": "string",
  "primary_users": ["string"],
  "secondary_users": ["string"],
  "assumptions": ["string"]
}`
            }
          ]
        },
        { role: "user", parts: [{ text: JSON.stringify(phase1Json) }] }
      ]
    });
    const phase2Json = JSON.parse(phase2.candidates[0].content.parts[0].text);

    // Phase 3: Research Primitive Generation (low temperature)
    const researchJson = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      temperature: 0.25,
      contents: [
        {
          role: "system",
          parts: [
            {
              text: `
You are a research primitive generator. Take Phase2 JSON and produce structured research primitives:
- keywords (core, features, problems, benefits, industry_terms, synonyms)
- queries (discovery, comparison, alternatives, pain_validation, pricing, compliance)
- market_axes (industries, company_sizes, regions, regulatory_contexts)
- competitor_signals (search_patterns, platforms, taxonomy_terms)
- risk_signals (adoption_barriers, trust_concerns, technical_risks)
Output strict JSON only.`
            }
          ]
        },
        { role: "user", parts: [{ text: JSON.stringify(phase2Json) }] }
      ]
    });

    const finalJson = JSON.parse(researchJson.candidates[0].content.parts[0].text);

    return res.json({
      phase1: phase1Json,
      phase2: phase2Json,
      research: finalJson
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}

