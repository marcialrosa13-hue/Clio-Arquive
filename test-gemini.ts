import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const GEMINI_API_KEY = process.env.CUSTOM_GEMINI_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

async function test() {
  console.log("Iniciando teste de conexão com Gemini...");
  console.log("Chave detectada (início):", GEMINI_API_KEY?.substring(0, 4));

  if (!GEMINI_API_KEY || GEMINI_API_KEY === "AI Studio Free Tier") {
    console.error("ERRO: Chave válida não encontrada no ambiente.");
    process.exit(1);
  }

  try {
    console.log("Listando modelos disponíveis...");
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(JSON.stringify(data));
    }
    
    console.log("Modelos encontrados:", data.models.map((m: any) => m.name).join(", "));
    
    const firstModel = data.models.find((m: any) => m.supportedGenerationMethods.includes("generateContent"));
    if (firstModel) {
      console.log(`Tentando com o primeiro modelo disponível: ${firstModel.name}`);
      const genUrl = `https://generativelanguage.googleapis.com/v1beta/${firstModel.name}:generateContent?key=${GEMINI_API_KEY}`;
      const genResponse = await fetch(genUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Responda apenas OK." }] }]
        })
      });
      const genData = await genResponse.json();
      console.log("Resposta:", genData.candidates[0].content.parts[0].text);
      console.log("TESTE CONCLUÍDO COM SUCESSO!");
    }
  } catch (error: any) {
    console.error("FALHA NO TESTE:");
    console.error(error);
    process.exit(1);
  }
}

test();
