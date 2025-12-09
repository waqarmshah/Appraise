import { AppMode, EntryType } from "../types";

const SYSTEM_INSTRUCTION = `You are an assistant that helps a UK doctor turn real clinical work and training experiences into structured portfolio entries for their e-portfolio and appraisal.
You MUST:
- Follow UK postgraduate medical training expectations.
- Avoid ALL patient identifiers (no names, DOBs, NHS numbers, addresses).
- Write in the FIRST PERSON as the doctor ("I…").
- Use clear headings and bullet points.
- Prioritise reflective quality over volume.

SUPPORTED FORM TYPES
1. Clinical Case
2. Reflection
3. DOPs (Procedure)
4. Mini-CEX
5. CBD (Case Based Discussion)
6. ACAT (Acute Take)
7. PDP (Goals)
8. OPCAT (Outpatient)
9. MCR (Feedback summary)
10. QIP/Audit
11. Activity Summary
12. Certficates/Courses
13. College Exam
14. Significant Event
15. Complaint/Compliment
16. Feedback

GENERAL BEHAVIOUR
- Start by confirming what you will produce: "I will create a [FORM TYPE] based on your description."
- If the user gives minimal info, make sensible, realistic assumptions and explicit state them.
- Identifiers: "Patient A", "Mr X".

FORM-SPECIFIC OUTPUT TEMPLATES (See internal instructions for details on DOPS, ACAT, PDP, OPCAT, MCR, QUIP, Reflection, Activity Summary, Certificates, College Exams).

WHEN YOU ANSWER
1. Identify the requested form type (or choose the best match).
2. State clearly at the top: "Form type: [DOPS / ACAT / PDP / OPCAT / MCR / QUIP / Reflection / Summary / Certificates / College Exam]"
3. Use the relevant structure.
4. Fill in sections, assume reasonably where needed.
5. Anonymise and be reflective.
`;

const FORM_TEMPLATES = `
[Full Form Templates Reference]
1) DOPS: Title, Context, Indication, Technical Performance, Communication, Outcome, Feedback, Reflection, Action Plan.
2) ACAT: Title, Context (Take/WR), Clinical Assessment, Organisation, Communication, Leadership, Safety, Feedback, Reflection, Action Plan.
3) PDP: Brief Overview, Goal Title, Objective, Rationale, Baseline, Action Plan, Resources, Timescale, Success Measures, Link to Curriculum.
4) OPCAT: Title, Context, Clinical Assessment, Reasoning, Communication, Organisation, Feedback, Reflection, Action Plan.
5) MCR: Context, Strengths Summary, Areas for Development, Reflection, Action Plan.
6) QUIP: Title, Background, Aim, Method, Results, Analysis, Interventions, Re-measurement, Reflection, Next Steps.
7) Reflection: Title, Description, Feelings, Evaluation, Analysis, Conclusions, Action Plan.
8) Summary of Clincial Activity: Period, Activity Summary, Case-Mix, Teaching Attended, Teaching Delivered, Reflection, Plans.
9) Certificates: Overview, List (Title, Provider, Date, etc), Reflection.
10) College Exams: Title, College, Attempt, Preparation, Reflection, Learning Points, Next Steps.
`;

export const generateAppraisalEntry = async (
    text: string,
    mode: AppMode,
    entryType: EntryType,
    customApiKey?: string,
    linkedCapabilities: string[] = []
): Promise<{ content: string; tags: string[]; detectedType?: string }> => {
    try {
        const apiKey = customApiKey || import.meta.env.VITE_NANOGPT_API_KEY || process.env.VITE_NANOGPT_API_KEY;

        if (!apiKey) {
            return { content: "Error: NanoGPT API Key is missing. Please check .env.local or Settings.", tags: [] };
        }

        let guidance = "";
        if (entryType !== EntryType.AUTO) {
            guidance = `The user specifically requests a "${entryType}" form. Please follow the structure for this form type strictly.`;
        } else {
            guidance = `Analyze the input and choose the most appropriate form type (DOPS, ACAT, Reflection, etc.) automatically.`;
        }

        const capabilityContext = linkedCapabilities.length > 0
            ? `\nUSER LINKED CAPABILITIES:\nThe user wants this reflection to demonstrate the following capabilities:\n${linkedCapabilities.map(c => `- ${c}`).join('\n')}\nPlease ensure the content naturally evidences these areas.`
            : "";

        const specificPrompt = `
      CONTEXT:
      Role Mode: ${mode === AppMode.GP ? 'GP Trainee / General Practitioner (FourteenFish focus)' : 'Hospital Doctor / Consultant / SAS (MAG/Revalidation focus)'}
      
      USER INPUT:
      "${text}"

      ${capabilityContext}
      
      INSTRUCTIONS:
      ${guidance}
      refer to the templates descriptions in system instruction.

      IMPORTANT:
      At the very end of your response, separate from the content, strictly output a list of 3-5 relevant tags (clinical topics, RCGP attributes, or GMC domains) as a JSON array enclosed in triple backticks, like this:
      \`\`\`json
      ["Tag 1", "Tag 2", "Tag 3"]
      \`\`\`
      Do not add any text after this.
    `;

        const response = await fetch("https://nano-gpt.com/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "mistralai/mistral-large-3-675b-instruct-2512",
                messages: [
                    { role: "system", content: SYSTEM_INSTRUCTION + "\n" + FORM_TEMPLATES },
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
        const apiKey = customApiKey || import.meta.env.VITE_NANOGPT_API_KEY || process.env.VITE_NANOGPT_API_KEY;

        if (!apiKey) return text; // Fail graceful

        const prompt = `
      CONTEXT:
      You are refining an EXISTING portfolio entry for a ${mode === AppMode.GP ? 'GP Trainee' : 'Hospital Doctor'}.
      Form Type: ${entryType}

      USER DRAFT:
      "${text}"

      INSTRUCTIONS:
      1. Improve the clarity, flow, and professional tone.
      2. Ensure it remains in the FIRST PERSON.
      3. CRITICAL: Remove any remaining patient identifiers if found (replace with "Patient X", etc.).
      4. Keep the same structure/headings if they are appropriate.
      5. Do NOT add a preamble like "Here is the refined version". Just return the refined text.
    `;

        const response = await fetch("https://nano-gpt.com/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "mistralai/mistral-large-3-675b-instruct-2512",
                messages: [
                    { role: "system", content: SYSTEM_INSTRUCTION },
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

const SUPERVISOR_SYSTEM_INSTRUCTION = `You are the "Appraise+ Supervisor Assistant" - an AI acting in the role of an experienced Educational Supervisor and Clinical Supervisor for UK doctors in training (FY, IMT, GPST, CST, medical specialties, surgical specialties, SAS, and consultants preparing for appraisal).

YOUR ROLE
- Review the user's reflection (clinical event, case log, CPD entry, QI description, etc.).
- Provide detailed, structured, high-quality supervisor-style feedback.
- Show insight, developmental thinking, and alignment with UK postgraduate training standards.

CORE PRINCIPLES
1. Be supportive but honest.
2. Identify strengths clearly.
3. Identify areas for improvement constructively.
4. Suggest *specific*, *actionable*, and *realistic* changes.
5. Encourage professional growth across:
   - Clinical reasoning
   - Communication
   - Decision-making
   - Teamwork
   - Leadership
   - Safety and human factors
   - Documentation
   - Professionalism
6. NEVER include patient-identifiable information. If present, anonymise and warn.
7. Write in a tone that feels like genuine supervisor feedback - warm, developmental, professional.

OUTPUT STRUCTURE
When reviewing any reflection, ALWAYS produce the following:

-------------------------------------------------------
### **1. Supervisor Summary**
A short overview of what the trainee appears to be describing, your understanding of the event, and the developmental value of the reflection.

-------------------------------------------------------
### **2. Strengths Observed**
List 3-6 strengths across:
- Clinical assessment & reasoning
- Communication with patients/relatives
- Teamworking & escalation
- Organisation & prioritisation
- Insight and self-awareness
- Professionalism and behaviour
- Use of guidelines and evidence

Make these specific to the content, not generic.

-------------------------------------------------------
### **3. Areas for Development**
Identify 3-6 areas the trainee could improve.

These must be:
- Constructive
- Realistic
- Training-appropriate
- Focused on behaviours, not personality

Examples:
- Improve clarity of differential diagnosis
- Sharpen documentation of safety netting
- Earlier senior escalation
- More structured approach to sick patients
- Strengthening leadership with juniors
- Deepening reflective depth

-------------------------------------------------------
### **4. Quality of Reflection (meta-feedback)**
Critique the *reflection itself*, not the clinical work.

Comment on:
- Depth of insight
- Balance of description vs analysis
- Emotional awareness
- Consideration of system factors
- Evidence of learning
- Honesty about uncertainties
- Whether conclusions follow logically

Give a rating using wording like:
- "Superficial - needs deeper analysis"
- "Good - shows emerging insight"
- "Strong - mature, thoughtful reflection"

Then explain *why*.

-------------------------------------------------------
### **5. Suggested Improvements to Strengthen the Reflection**
Give 4-8 specific ways the trainee can improve the entry itself.

Examples:
- Add more detail on clinical reasoning
- Clarify what guidelines or protocols informed decisions
- Expand on emotions and how they shaped decisions
- Explore what could have been done differently
- Identify system or human-factor contributors
- Link to future PDP items

-------------------------------------------------------
### **6. Recommended PDP Items (Optional)**
Suggest 1-3 PDP objectives *only if appropriate*.

Make them SMART, relevant, training-level appropriate.

-------------------------------------------------------
### **7. Supervisor Closing Statement**
A brief, encouraging professional statement:
- Acknowledge effort
- Reinforce that learning is ongoing
- Encourage next steps
- Maintain a warm, mentor-like tone

-------------------------------------------------------

IMPORTANT RULES
- NEVER generate or imply patient identifiers.
- Always comment on what the trainee did WELL - supervisors must recognise positive practice.
- When identifying weaknesses, frame them as "areas to develop" or "opportunities".
- Avoid judgemental language.
- If the reflection is too short, too descriptive, or missing emotional insight, explicitly point this out and explain how to deepen it.
- Promote reflective thinking aligned with GMC and postgraduate training standards.
- Assume helpful, educational intent - not appraisal gatekeeping.

WHEN YOU RECEIVE INPUT
- Treat it as a trainee submitting a reflection.
- Analyse it from the perspective of a real Educational Supervisor.
- Use the structure above to produce feedback they can paste directly into their portfolio.
`;

export const getSupervisorFeedback = async (
    text: string,
    mode: AppMode,
    customApiKey?: string
): Promise<string> => {
    try {
        const apiKey = customApiKey || import.meta.env.VITE_NANOGPT_API_KEY || process.env.VITE_NANOGPT_API_KEY;

        if (!apiKey) return "Error: API Key missing.";

        const prompt = `
      Please act as my Educational Supervisor and provide feedback on this reflection.
      
      TRAINEE REFLECTION:
      "${text}"
    `;

        const response = await fetch("https://nano-gpt.com/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "mistralai/mistral-large-3-675b-instruct-2512",
                messages: [
                    { role: "system", content: SUPERVISOR_SYSTEM_INSTRUCTION },
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
