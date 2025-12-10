import { AppMode, EntryType } from "../types";
import {
    APPRAISAL_SYSTEM_PROMPT,
    FORM_TEMPLATES_PROMPT,
    SUPERVISOR_SYSTEM_PROMPT,
    buildGenerationPrompt,
    buildRefinePrompt,
    buildSupervisorPrompt,
} from "./prompts";

const DEFAULT_NANOGPT_API_KEY = "sk-nano-7b1a7424-93e6-4e6d-a968-171bedee4735";

export const generateAppraisalEntry = async (
    text: string,
    mode: AppMode,
    entryType: EntryType,
    customApiKey?: string,
    linkedCapabilities: string[] = []
): Promise<{ content: string; tags: string[]; detectedType?: string }> => {
    try {
        const apiKey = customApiKey || import.meta.env.VITE_NANOGPT_API_KEY || process.env.VITE_NANOGPT_API_KEY || DEFAULT_NANOGPT_API_KEY;

        if (!apiKey) {
            return { content: "Error: NanoGPT API Key is missing. Please check .env.local or Settings.", tags: [] };
        }

        const specificPrompt = buildGenerationPrompt(text, mode, entryType, linkedCapabilities);

        const response = await fetch("https://nano-gpt.com/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "mistralai/mistral-large-3-675b-instruct-2512",
                messages: [
                    { role: "system", content: APPRAISAL_SYSTEM_PROMPT + "\n" + FORM_TEMPLATES_PROMPT },
                    { role: "user", content: specificPrompt }
                ]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("NanoGPT API Error:", errorText);
            return { content: `Error calling AI Provider: ${response.statusText}`, tags: [] };
        }

        const data = await response.json();
        const fullText = data.choices?.[0]?.message?.content || "Failed to generate reflection. Please try again.";

        // Parse tags
        let content = fullText;
        let tags: string[] = [];
        let detectedType = undefined;

        // Try to match JSON block
        const jsonMatch = fullText.match(/```json\s*(\[[\s\S]*?\])\s*```/);
        if (jsonMatch) {
            try {
                tags = JSON.parse(jsonMatch[1]);
                // Remove JSON block from content
                content = fullText.replace(jsonMatch[0], '').trim();
            } catch (e) {
                console.error("Failed to parse tags JSON", e);
            }
        } else {
            // Fallback: Try match double brackets
            const tagMatch = fullText.match(/\[\[(.*?)\]\]$/s);
            if (tagMatch) {
                content = fullText.replace(tagMatch[0], '').trim();
                tags = tagMatch[1].split(',').map((t: string) => t.trim()).filter(Boolean);
            }
        }

        // Attempt to extract Form Type
        // Regex is now case insensitive and handles potential variations
        const typeMatch = content.match(/^Form type:\s*\[?(.*?)\]?$/im);
        if (typeMatch) {
            detectedType = typeMatch[1].trim();
        } else {
            // Fallback: Look for "Form type:" anywhere if start-of-line match fails
            const looseMatch = content.match(/Form type:\s*\[?(.*?)\]?$/im);
            if (looseMatch) {
                detectedType = looseMatch[1].trim();
            }
        }

        // STRICT VALIDATION & MAPPING
        let finalType = EntryType.CLINICAL; // Default fallback
        let bestMatchScore = 0;

        if (detectedType) {
            const normalizedDetected = detectedType.toLowerCase().trim();
            const validTypes = Object.values(EntryType).filter(t => t !== EntryType.AUTO);

            for (const type of validTypes) {
                const normalizedType = type.toLowerCase();

                // Exact match
                if (normalizedDetected === normalizedType) {
                    finalType = type;
                    bestMatchScore = 1;
                    break;
                }

                // Substring match (e.g. "DOPs" inside "DOPS (Procedure)")
                // We value longer matches more to avoid false positives
                if (normalizedType.includes(normalizedDetected) || normalizedDetected.includes(normalizedType)) {
                    // Simple heuristic: if significant overlap
                    finalType = type;
                    bestMatchScore = 0.8;
                }
            }
        }

        detectedType = finalType;

        return { content, tags, detectedType };

    } catch (error) {
        console.error("Error calling AI Service:", error);
        return { content: "Error generating content. Please check your connection or try again.", tags: [] };
    }
};

export const refineAppraisalEntry = async (
    text: string,
    mode: AppMode,
    entryType: EntryType,
    customApiKey?: string
): Promise<string> => {
    try {
        const apiKey = customApiKey || import.meta.env.VITE_NANOGPT_API_KEY || process.env.VITE_NANOGPT_API_KEY || DEFAULT_NANOGPT_API_KEY;

        if (!apiKey) return text; // Fail graceful

        const prompt = buildRefinePrompt(text, mode, entryType);

        const response = await fetch("https://nano-gpt.com/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "mistralai/mistral-large-3-675b-instruct-2512",
                messages: [
                    { role: "system", content: APPRAISAL_SYSTEM_PROMPT },
                    { role: "user", content: prompt }
                ]
            })
        });

        if (!response.ok) throw new Error(response.statusText);

        const data = await response.json();
        let refined = data.choices?.[0]?.message?.content || text;

        // Strip tags if they appear again
        const tagMatch = refined.match(/\[\[(.*?)\]\]$/s);
        if (tagMatch) {
            refined = refined.replace(tagMatch[0], '').trim();
        }

        return refined;
    } catch (error) {
        console.error("Refine error:", error);
        return text; // Return original on error
    }
};

export const getSupervisorFeedback = async (
    text: string,
    mode: AppMode,
    customApiKey?: string
): Promise<string> => {
    try {
        const apiKey = customApiKey || import.meta.env.VITE_NANOGPT_API_KEY || process.env.VITE_NANOGPT_API_KEY || DEFAULT_NANOGPT_API_KEY;

        if (!apiKey) return "Error: API Key missing.";

        const prompt = buildSupervisorPrompt(text);

        const response = await fetch("https://nano-gpt.com/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "mistralai/mistral-large-3-675b-instruct-2512",
                messages: [
                    { role: "system", content: SUPERVISOR_SYSTEM_PROMPT },
                    { role: "user", content: prompt }
                ]
            })
        });

        if (!response.ok) throw new Error(response.statusText);

        const data = await response.json();
        return data.choices?.[0]?.message?.content || "No feedback generated.";

    } catch (error) {
        console.error("Supervisor feedback error:", error);
        return "Failed to generate supervisor feedback. Please try again.";
    }
};
