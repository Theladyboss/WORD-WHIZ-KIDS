
import { GoogleGenAI } from "@google/genai"; // Keep for types if needed, or remove. Actually remove to save size.

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
        // URGENT FIX: Hardcoded key for deployment stability
        const apiKey = "AIzaSyC8vxq5xYN5YZl07b-q8S-p7nW5dSACkmM";

        if (!apiKey) {
            console.error("GEMINI_API_KEY is missing");
            return new Response(JSON.stringify({ error: "Server configuration error" }), {
                status: 500,
                headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
            });
        }

        const systemPrompt = `You are Lexa, the AI Co-Pilot for FreedomAi Solutions.
    Your mission is to help overwhelmed solopreneurs, educators, and multi-hyphenates understand how AI can save them time and sanity.

    Tone: Extremely friendly, patient, warm, and professional.
    
    Key Instructions:
    - ALWAYS be patient.
    - Mention the 4-week workshop launching March 2025.
    - Responses must be SHORT (under 3 sentences) for voice.
    - END EVERY RESPONSE WITH A RELEVANT QUESTION.`;

        // Direct REST API call
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [
                    { role: "user", parts: [{ text: "System Instruction: " + systemPrompt }] },
                    { role: "model", parts: [{ text: "Understood. I'm Lexa. How can I help?" }] },
                    ...(history || []).map((msg: any) => ({
                        role: msg.role === 'user' ? 'user' : 'model',
                        parts: [{ text: msg.content }]
                    })),
                    { role: "user", parts: [{ text: message }] }
                ]
            })
        });

        const data = await response.json();

        if (data.error) {
            console.error("Gemini API Error:", data.error);
            return new Response(JSON.stringify({ error: data.error.message }), {
                status: 500,
                headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
            });
        }

        const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm having trouble thinking right now.";

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
