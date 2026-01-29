


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
        const { text, voiceId } = await req.json();
        // URGENT FIX: Hardcoded key for deployment stability
        const apiKey = "AIzaSyC8vxq5xYN5YZl07b-q8S-p7nW5dSACkmM";

        if (!apiKey) {
            console.error("API Key is missing");
            return new Response(JSON.stringify({ error: "Server configuration error" }), {
                status: 500,
                headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
            });
        }

        // We use the REST API directly for TTS as it's part of Google Cloud, 
        // using the same API key if enabled.
        const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;

        // Default to "Journey" voice (Expressive Neural2)
        // Options: en-US-Journey-F (Female), en-US-Journey-D (Male)
        const selectedVoice = voiceId || "en-US-Journey-O";

        const requestBody = {
            input: { text: text },
            voice: { languageCode: "en-US", name: selectedVoice },
            audioConfig: { audioEncoding: "MP3" }
        };

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        if (data.error) {
            console.error("TTS API Error:", data.error);
            // Fallback logic could be handled on client, but let's return error
            return new Response(JSON.stringify({ error: data.error.message }), {
                status: 500,
                headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
            });
        }

        return new Response(JSON.stringify({ audioContent: data.audioContent }), {
            status: 200,
            headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        });

    } catch (error) {
        console.error("Error processing TTS request:", error);
        return new Response(JSON.stringify({ error: "Failed to process request" }), {
            status: 500,
            headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        });
    }
};
