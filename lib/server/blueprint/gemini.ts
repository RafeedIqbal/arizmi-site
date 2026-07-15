import "server-only";

/**
 * Google Gemini adapter (resolves D-03). Reads no environment: the API key
 * and model are resolved in ai.ts and passed in, so this module stays outside
 * the documented env-read boundary.
 *
 * Structured output (responseMimeType + responseJsonSchema) constrains the
 * model to the diagnosis/plan shape; the runtime validators in
 * lib/blueprint/schema.ts remain the trust boundary. Any transport failure,
 * safety block, or malformed JSON throws so the harness in ai.ts classifies
 * and retries it — this adapter never fabricates output.
 */
import { GoogleGenAI } from "@google/genai";
import {
  DIAGNOSIS_RESPONSE_SCHEMA,
  PLAN_RESPONSE_SCHEMA,
  buildDiagnosisPrompt,
  buildPlanPrompt,
  type PromptMessages,
} from "./prompts";
import type { BlueprintAdapter, GenerationInput } from "./ai";

export function createGeminiAdapter(apiKey: string, model: string): BlueprintAdapter {
  const client = new GoogleGenAI({ apiKey });

  async function generate(
    messages: PromptMessages,
    schema: unknown,
    signal: AbortSignal,
  ): Promise<unknown> {
    const response = await client.models.generateContent({
      model,
      contents: messages.user,
      config: {
        abortSignal: signal,
        systemInstruction: messages.system,
        responseMimeType: "application/json",
        responseJsonSchema: schema,
        temperature: 0.3,
      },
    });
    const text = response.text;
    // Empty text means a safety block or no candidates; treat as a provider
    // failure so the harness retries instead of validating nothing.
    if (!text) throw new Error("empty_response");
    return JSON.parse(text);
  }

  return {
    id: `gemini:${model}`,
    mode: "real",
    diagnose: (input: GenerationInput, signal: AbortSignal) =>
      generate(
        buildDiagnosisPrompt(input.qualifying, input.intake, input.addedDetail),
        DIAGNOSIS_RESPONSE_SCHEMA,
        signal,
      ),
    plan: (input: GenerationInput, signal: AbortSignal) =>
      generate(
        buildPlanPrompt(input.qualifying, input.intake, input.addedDetail),
        PLAN_RESPONSE_SCHEMA,
        signal,
      ),
  };
}
