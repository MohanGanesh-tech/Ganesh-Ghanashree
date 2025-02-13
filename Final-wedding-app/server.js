require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const path = require("path");

const app = express();
app.use(express.json());
app.use(cors());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const KNOWLEDGE_BASE = `
You are a wedding assistant, and you must only respond based on the wedding details provided below.
Do not generate general wedding advice. Answer only from the information given.

## Couple Details:
- Groom: Ganesh N. (s/o Smt. Manjula R. and Sri Nagaraj V.)
- Bride: Ghanashree B. (d/o Smt. Suma G. and Sri Bhakthavatsala C.M.)

## Wedding Details:
- Reception: 22nd February 2025, Saturday, 6:30 PM onwards.
- Muhurtham: 23rd February 2025, Sunday, 9:50 AM to 11:00 AM.
- Venue: Bandimane Kalyana Mantapa, Gubbi Road, Tumkur - 572107.

## Preferences:
- Food: Both love biryani.
- Color: Ganesh prefers white, and Ghanashree loves blue.
- Beverages: Both enjoy coffee; Ganesh dislikes soft drinks, while Ghanashree likes Coke.
- Places: Ganesh’s favorite is Mullayangiri; Ghanashree loves BR Hills.
- Nature: Both prefer mountains over beaches.
- Movies/Series: Ganesh enjoys movies; Ghanashree loves K-dramas.

## Background:
- Ganesh: Born in Bangalore, living in Tumkur, BE in Computer Science, introverted.
- Ghanashree: Born & raised in Bangalore, studying Psychology in Arts, extroverted.

## Love story:
- In the vibrant corridors of youth, two souls unknowingly brushed past one another, a fleeting moment lost to time. Years later, like a twist of fate, they met again at a celebration — the spark between them reigniting with an intensity that neither had expected. With hearts full of courage, one dared to propose, a promise of forever blooming amidst uncertainty, only for life to pull them apart. But love, in its most resilient form, never fades. Time passed, paths were carved, and yet, their connection grew stronger, as if written in the stars. Together, they ventured through winding roads, shared laughter, and the magic of small, sweet conflicts. And when destiny finally whispered "now," they sealed their bond with a vow, forever weaving their story into the fabric of time, where love knows no end.

You must only answer questions related to this information.
`;

// ✅ Serve static files (Frontend)
app.use(express.static(path.join(__dirname, "public")));

// ✅ Serve index.html for all non-API routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ✅ Chat API with OpenAI
app.post("/chat", async (req, res) => {
    try {
        const { userText } = req.body;

        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-4o",
                messages: [
                    { role: "system", content: KNOWLEDGE_BASE }, // Context
                    { role: "user", content: userText }
                ],
            },
            {
                headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
            }
        );

        res.json({ aiResponse: response.data.choices[0].message.content });
    } catch (error) {
        console.error("OpenAI Chat Error:", error.response?.data || error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ✅ Voice API with OpenAI (Human-like Speech)
app.post("/voice", async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ error: "Text is required" });
        }

        const response = await axios.post(
            "https://api.openai.com/v1/audio/speech",
            {
                model: "tts-1", // OpenAI TTS Model
                input: text,
                voice: "alloy" // Options: alloy, echo, onyx, fable, nova, shimmer
            },
            {
                headers: {
                    Authorization: `Bearer ${OPENAI_API_KEY}`,
                    "Content-Type": "application/json"
                },
                responseType: "stream" // Stream audio back
            }
        );

        // Send the audio stream to the client
        res.setHeader("Content-Type", "audio/mpeg");
        response.data.pipe(res);
    } catch (error) {
        console.error("OpenAI TTS Error:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to generate speech" });
    }
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
