const { GoogleGenAI } = require("@google/genai");
const z = require("zod");
const puppeteer = require("puppeteer");

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

const interviewReportSchema = z.object({
    title: z.string(),
    matchScore: z.number().min(0).max(100),
    technicalQuestions: z.array(z.object({
        question: z.string(),
        intention: z.string(),
        answer: z.string()
    })).length(5),
    behavioralQuestions: z.array(z.object({
        question: z.string(),
        intention: z.string(),
        answer: z.string()
    })).length(5),
    skillGaps: z.array(z.object({
        skill: z.string(),
        severity: z.string()
    })),
    preparationPlan: z.array(z.object({
        day: z.number().min(1).max(7),
        focus: z.string(),
        tasks: z.array(z.string())
    })).length(7)
});

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {

    const prompt = `You are an expert technical interviewer and recruitment specialist.
Analyze the following candidate information data files and generate a structured interview report.

================ CANDIDATE RESUME ================
${resume}

================ SELF DESCRIPTION ================
${selfDescription}

================ JOB DESCRIPTION ================
${jobDescription}

CRITICAL RULES:
1. You MUST populate EVERY single field requested in the JSON schema.
2.You MUST generate exactly 5 deeply technical questions inside the technicalQuestions array, targeting deep engineering profiles and architectural gaps.
3. You MUST generate exactly 5 comprehensive scenario-based questions inside the behavioralQuestions array matching the STAR framework layout.
4. Fill technicalQuestions, behavioralQuestions, skillGaps, and preparationPlan arrays with deeply detailed objects.
5. Under skillGaps, enforce that 'severity' string must be textually exact to 'low', 'medium', or 'high'.
6. For preparationPlan, you MUST generate exactly a 7-day preparation plan. The array must contain exactly 7 objects representing Day 1 through Day 7 sequentially.
7. Do NOT leave fields blank or omit arrays.`;

    const GoogleSchema = {
        type: "OBJECT",
        properties: {
            title: { 
                type: "STRING", 
                description: "The targeted role title extracted from the job description context." 
            },
            matchScore: { 
                type: "INTEGER", 
                description: "Alignment scoring index evaluate between 0 and 100." 
            },
            technicalQuestions: {
                type: "ARRAY",
                description: "An array containing exactly 5 highly detailed technical interview questions tailored to the role context.", 
                items: {
                    type: "OBJECT",
                    properties: {
                        question: { type: "STRING", description: "Deep architectural technical question targeting profile gaps." },
                        intention: { type: "STRING", description: "The baseline reasoning strategy the interviewer is testing." },
                        answer: { type: "STRING", description: "Thorough model response outline for candidate guidance." }
                    },
                    required: ["question", "intention", "answer"]
                }
            },
            behavioralQuestions: {
                type: "ARRAY",
                 description: "An array containing exactly 5 comprehensive behavioral questions mapping to workplace psychology indices.",
                items: {
                    type: "OBJECT",
                    properties: {
                        question: { type: "STRING", description: "Scenario based cultural or team debugging challenge matching the STAR framework layout." },
                        intention: { type: "STRING", description: "The underlying workplace psychology metric evaluated." },
                        answer: { type: "STRING", description: "Strategic response framework guidance metrics." }
                    },
                    required: ["question", "intention", "answer"]
                }
            },
            skillGaps: {
                type: "ARRAY",
                items: {
                    type: "OBJECT",
                    properties: {
                        skill: { type: "STRING", description: "Missing requirement framework item on the active resume mapping." },
                        severity: { type: "STRING", description: "Priority tracking tier. Must evaluate directly to: low, medium, or high." }
                    },
                    required: ["skill", "severity"]
                }
            },
            preparationPlan: {
                type: "ARRAY",
                description: "A chronological 7-day study roadmap with exactly 7 distinct sequential objects (Day 1 through Day 7).", // 👈 Added global array description constraint
                items: {
                    type: "OBJECT",
                    properties: {
                        day: { type: "INTEGER", description: "Day counter integer tracking milestones starting at 1 and incrementing sequentially up to exactly 7." }, // 👈 Explicit upper bound restriction
                        focus: { type: "STRING", description: "Ecosystem block target study topic for the candidate." },
                        tasks: { 
                            type: "ARRAY", 
                            items: { type: "STRING" },
                            description: "Explicit coding practice items or conceptual tutorials lists." 
                        }
                    },
                    required: ["day", "focus", "tasks"]
                }
            }
        },
        required: ["title", "matchScore", "technicalQuestions", "behavioralQuestions", "skillGaps", "preparationPlan"]
    };

    const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: GoogleSchema
        }
    });

    if (!response || !response.text) {
        throw new Error("Gemini returned an empty response");
    }

    let parsedData;

    try {
        parsedData = JSON.parse(response.text);
    } catch (error) {
        console.error("Invalid JSON from Gemini:", response.text);
        throw new Error("Gemini returned invalid JSON");
    }

    const validatedData = interviewReportSchema.parse(parsedData);
    return validatedData;

}

async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' })

    const pdfBuffer = await page.pdf({ format: 'A4',margin:
    { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' }
     });
    await browser.close();
    return pdfBuffer;
}


async function generateResumePdf({ resume, selfDescription, jobDescription }) {
    const resumePdfSchema = z.object({
        html: z.string().describe("The HTML content of the resume which can be converted to PDF using any library like puppeteer")
    })

    const prompt = `Generate resume for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}

                        the response should be a JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF using any library like puppeteer.
                        The resume should be tailored for the given job description and should highlight the candidate's strengths and relevant experience. The HTML content should be well-formatted and structured, making it easy to read and visually appealing.
                        The content of resume should be not sound like it's generated by AI and should be as close as possible to a real human-written resume.
                        you can highlight the content using some colors or different font styles but the overall design should be simple and professional.
                        The content should be ATS friendly, i.e. it should be easily parsable by ATS systems without losing important information.
                        The resume should not be so lengthy, it should ideally be 1-2 pages long when converted to PDF. Focus on quality rather than quantity and make sure to include all the relevant information that can increase the candidate's chances of getting an interview call for the given job description.`;

    const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: prompt,
    config: {
    responseMimeType: "application/json"

    }
});

    if (!response || !response.text) {
    throw new Error("Gemini returned an empty response");
}

    const jsonContent = JSON.parse(response.text);

    if (!jsonContent.html || typeof jsonContent.html !== "string") {
    throw new Error("Gemini response does not contain valid HTML");
}

    const pdfBuffer = await generatePdfFromHtml(jsonContent.html);

    return pdfBuffer;
    
}

module.exports = { generateInterviewReport, generateResumePdf };
