import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

// Gebruik het snelle flash model
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

app.use(cors());
app.use(express.json());

// Lijst met reserve-ideeën voor als Gemini even hapert
const backups = [
    "cute snowman in winter forest watercolor style",
    "santa claus drinking hot chocolate by fireplace",
    "reindeer playing in snow under northern lights",
    "cozy christmas cabin in mountains at night",
    "vintage christmas market scene with lights"
];

async function getPrompts() {
    const promptRequest = "Describe a unique, magical christmas card scene in English. Keep it short (max 10 words), visual, and artistic. Output ONLY the description.";
    try {
        const result = await model.generateContent(promptRequest);
        const response = await result.response;
        return response.text().trim();
    } catch (error) {
        console.error("Gemini even niet bereikbaar, gebruik backup...", error.message);
        // Kies een willekeurige backup
        return backups[Math.floor(Math.random() * backups.length)];
    }
}

app.get('/visit', async (req, res) => {
    try {
        // 1. Vraag Gemini direct om een vers idee
        const promptText = await getPrompts();
        console.log("Nieuw idee gegenereerd:", promptText);

        // 2. Voeg een willekeurig getal (seed) toe. 
        // Dit dwingt Pollinations om ALTIJD een nieuw plaatje te maken, 
        // zelfs als de tekst hetzelfde zou zijn.
        const randomSeed = Math.floor(Math.random() * 999999);
        
        const imageURL = `https://image.pollinations.ai/prompt/${encodeURIComponent(promptText)}?seed=${randomSeed}&nologo=true`;

        // 3. Stuur direct terug naar tante
        res.json({ imageUrl: imageURL });

    } catch (error) {
        console.error("Critical error:", error);
        res.status(500).json({ error: "Kerstmagie is even op." });
    }
});

app.listen(PORT, () => console.log(`Server draait op poort ${PORT}`));