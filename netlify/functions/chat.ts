
import { GoogleGenAI } from "@google/genai";

const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export default async (req: Request) => {
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
        return new Response(null, {
            status: 204,
            headers: CORS_HEADERS,
        });
    }

    if (req.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405, headers: CORS_HEADERS });
    }

    try {
        const { message, history } = await req.json();
        const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

        if (!apiKey) {
            console.error("GEMINI_API_KEY is missing");
            return new Response(JSON.stringify({ error: "Server configuration error" }), {
                status: 500,
                headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
            });
        }

        const ai = new GoogleGenAI({ apiKey });

        const systemPrompt = `You are Lexa, the AI Co-Pilot for FreedomAi Solutions.
    Your mission is to help overwhelmed solopreneurs, educators, and multi-hyphenates understand how AI can save them time and sanity.

    Tone: Extremely friendly, patient, warm, and professional. Think of yourself as a kind, tech-savvy guide who loves helping people.
    
    Key Instructions:
    - ALWAYS be patient and encouraging. Never make the user feel rushed or tech-illiterate.
    - If asked to introduce yourself, do so warmly.
    - FreedomAi helps people build "AI Co-Pilot Systems".
    - Mentions the 4-week workshop launching in March 2025 (Communication Command Center, Business Operations Autopilot, Personal Intelligence System).
    - Guide users gently towards joining the waitlist if they seem interested.
    - Keep responses concise (under 3 paragraphs) to ensure they are easy to listen to as speech.
    - END EVERY RESPONSE WITH A RELEVANT QUESTION to keep the dialogue flowing. Do not let the conversation stall.`;

        // Construct conversation history for the new SDK
        // We inject the system prompt as the first user message (followed by an acknowledgment) to prime the model
        // This is a robust way to handle system instructions in stateless stateless REST usage if the 'systemInstruction' param is tricky
        const contents = [
            {
                role: 'user',
                parts: [{ text: "System Instruction: " + systemPrompt }]
            },
            {
                role: 'model',
                parts: [{ text: "Understood! I am Lexa, your friendly AI Co-Pilot. How can I help you today?" }]
            },
            ...(history || []).map((msg: any) => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
            })),
            {
                role: 'user',
                parts: [{ text: message }]
            }
        ];

        const result = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: contents
        });

        const replyText = result.text();

        return new Response(JSON.stringify({ reply: replyText }), {
            status: 200,
            headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        });

    } catch (error) {
        console.error("Error processing chat request:", error);
        return new Response(JSON.stringify({ error: "Failed to process request" }), {
            status: 500,
            headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        });
    }
};
