import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;
const DB_FILE = './db.json';

// Je Gemini API key (gratis via Google AI Studio)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(cors());
app.use(express.json());

// Initialiseer database als die niet bestaat
async function initDB() {
  try {
    await fs.access(DB_FILE);
  } catch {
    const initialData = {
      currentImage: "https://image.pollinations.ai/prompt/cozy%20christmas%20fireplace%20vector%20art", // Start afbeelding
      nextImage: null, // Hier komt de volgende te staan
      lastVisit: Date.now()
    };
    await fs.writeFile(DB_FILE, JSON.stringify(initialData, null, 2));
  }
}

// Hulpfunctie: Vraag Gemini om een nieuwe kerst-prompt
async function generateNewPrompt() {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const prompt = "Bedenk een korte, visuele beschrijving in het Engels voor een warme, nostalgische kerstkaart. Alleen de beschrijving, geen inleiding.";
  
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text(); // Dit is de beschrijving voor de plaatjes-maker
  } catch (error) {
    console.error("Gemini fout:", error);
    return "cute snowman in winter forest"; // Fallback
  }
}

// 1. Endpoint voor de bezoeker (Je tante)
app.get('/visit', async (req, res) => {
  const data = JSON.parse(await fs.readFile(DB_FILE, 'utf-8'));
  
  // Wat laten we zien? De huidige afbeelding.
  const imageToShow = data.currentImage;

  // LOGICA: Hebben we al een 'volgende' klaarstaan van de vorige keer?
  // Zo ja, dan wordt die NU de 'current' voor de *volgende* keer dat ze komt.
  // We 'swappen' ze pas na het serveren, of bereiden de swap voor.
  
  if (data.nextImage) {
      // Schuif de 'next' door naar 'current' voor de toekomst
      data.currentImage = data.nextImage;
      data.nextImage = null; // De 'next' slot is nu leeg
  }

  // Sla de update op (zodat bij F5/refresh ze de nieuwe ziet, of pas later)
  // Als je wilt dat ze bij 1 bezoek echt 1 plaatje ziet en pas morgen een nieuwe,
  // moet je hier een tijdscheck toevoegen. Voor nu doen we: elk bezoek = wissel.
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));

  // Trigger de generatie voor de TOEKOMST (fire and forget)
  generateNextCardInBackground();

  res.json({ imageUrl: imageToShow });
});

// 2. Het achtergrondproces (Triggered, maar wacht niet op antwoord)
async function generateNextCardInBackground() {
    console.log("Start generatie voor volgende keer...");
    
    // Stap A: Vraag Gemini een idee
    const promptText = await generateNewPrompt();
    console.log("Nieuw idee:", promptText);

    // Stap B: Maak URL voor Pollinations (gratis image gen)
    // We encoden de prompt zodat hij in een URL past
    const imageURL = `https://image.pollinations.ai/prompt/${encodeURIComponent(promptText)}?nologo=true`;

    // Stap C: Sla op in de 'nextImage' slot
    const data = JSON.parse(await fs.readFile(DB_FILE, 'utf-8'));
    data.nextImage = imageURL;
    
    await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
    console.log("Volgende kaart staat klaar in de wachtkamer!");
}

initDB().then(() => {
  app.listen(PORT, () => console.log(`Server draait op http://localhost:${PORT}`));
});