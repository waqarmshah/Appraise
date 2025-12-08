import { GoogleGenAI } from "@google/genai";
import { AppMode, EntryType } from "../types";

const SYSTEM_INSTRUCTION = `You are the "Appraisal Accelerator", an assistant that converts a doctor's real clinical work into GMC-compliant appraisal, revalidation, and (for GP trainees) FourteenFish / ESR-ready outputs in the UK.

GOALS:
1. Take messy, real-world input (notes, bullet points) and turn it into reflective case logs, CPD records, QI write-ups, etc.
2. Always cover the doctor's WHOLE scope of work.
3. Map content to GMC domains and supporting information types.
4. Use reflective, developmental language ("I...").

SAFE DATA HANDLING:
- NEVER generate or retain patient identifiable information (no names, DOB, addresses, hospital numbers).
- Replace identifiers with "Mr A", "Patient X", etc.
- Assume UK practice.

OUTPUT FORMATTING:
- Use Markdown.
- Use bold headings.

MODES:
1. GP TRAINEE (FourteenFish / ESR Mode):
   - Focus on Clinical Case Reviews, QIA, Safeguarding, Skills.
   - Headers: "Clinical Case Reviews", "Quality Improvement Activity", "Significant Events", "CPD", "Feedback", "PDP".
   - For Clinical Cases: Title, Setting, Clinical Experience Groups, Capabilities (Data gathering, Clinical management, etc.), Case Summary, Reflection (Challenging, What I did well, What I'd do differently), Learning Needs.

2. HOSPITAL DOCTOR (MAG / Revalidation Mode):
   - Focus on 6 categories of supporting info and 4 GMC domains.
   - Headers: "Scope and Nature of Work", "Supporting Information", "GMC Domain Mapping", "Reflection", "PDP".
   - Map to: 1) Knowledge skills performance, 2) Safety & quality, 3) Communication, 4) Maintaining trust.

BEHAVIOUR:
- Start with a title for the entry.
- Write in the first person ("I").
- Be professional but reflective.
`;

export const generateAppraisalEntry = async (
  text: string,
  mode: AppMode,
  entryType: EntryType
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    let specificPrompt = `
      Input Text: "${text}"
      
      Role: ${mode === AppMode.GP ? 'GP Trainee / GP' : 'Hospital Doctor / Consultant / SAS'}
      Task: Convert this input into a structured appraisal entry.
    `;

    if (entryType !== EntryType.AUTO) {
      specificPrompt += `\nFocus specifically on creating a "${entryType}" entry.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
      contents: specificPrompt,
    });

    return response.text || "Failed to generate reflection. Please try again.";
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Error generating content. Please check your connection or try again.";
  }
};