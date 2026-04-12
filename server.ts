import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { MercadoPagoConfig, Preference } from "mercadopago";
import dotenv from "dotenv";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

dotenv.config();

// In AI Studio Build, the Gemini API key is often provided directly in the environment 
// as GEMINI_API_KEY or GOOGLE_API_KEY.
// We added CUSTOM_GEMINI_KEY as a workaround if the default fields are locked.
const GEMINI_API_KEY = process.env.CUSTOM_GEMINI_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

if (!GEMINI_API_KEY || GEMINI_API_KEY === "AI Studio Free Tier") {
  console.error("CRITICAL: Valid Gemini API Key not found. Please set CUSTOM_GEMINI_KEY.");
} else {
  console.log(`Gemini API Key detected (starts with: ${GEMINI_API_KEY.substring(0, 4)}...)`);
}

const ai = new GoogleGenerativeAI(GEMINI_API_KEY || "");

async function searchHistoricalSourcesServer(query: string) {
  const model = ai.getGenerativeModel({ 
    model: "gemini-flash-latest",
    systemInstruction: `Você é o assistente historiográfico principal do Clio Archive, um historiador profissional e arquivista digital.
SUA MISSÃO: Localizar fontes históricas primárias e secundárias com rigor acadêmico.

DIRETRIZES DE PESQUISA:
1. FONTES REAIS: Priorize links diretos para PDFs ou páginas de visualização em repositórios como SciELO, JSTOR, Google Acadêmico, BNDigital (Biblioteca Nacional), e repositórios de universidades (USP, UNICAMP, etc.).
2. ANÁLISE CRÍTICA: Para cada fonte, explique o viés ideológico, o contexto de produção e a importância para a historiografia.
3. CITAÇÃO ABNT: Forneça sempre a citação completa em normas ABNT NBR 6023.
4. VERIFICAÇÃO: Se não encontrar um link direto, forneça o caminho exato para localização física ou digital em arquivos públicos.

ESTILO: Acadêmico, porém acessível. Use terminologia historiográfica correta (ex: longa duração, micro-história, cultura política).`
  });

  const response = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: `Pesquise fontes históricas sobre: ${query}` }] }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          summary: { type: SchemaType.STRING },
          sources: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                title: { type: SchemaType.STRING },
                author: { type: SchemaType.STRING },
                date: { type: SchemaType.STRING },
                institution: { type: SchemaType.STRING },
                url: { type: SchemaType.STRING },
                description: { type: SchemaType.STRING },
                socialContext: { type: SchemaType.STRING },
                historiographicalSchool: { type: SchemaType.STRING },
                criticalAnalysis: { type: SchemaType.STRING },
                type: { type: SchemaType.STRING },
                abntCitation: { type: SchemaType.STRING }
              },
              required: ["title", "url", "description", "type", "abntCitation"]
            }
          }
        },
        required: ["summary", "sources"]
      }
    }
  });

  return JSON.parse(response.response.text());
}

async function generateResearchProjectServer(theme: string) {
  const model = ai.getGenerativeModel({ 
    model: "gemini-flash-latest",
    systemInstruction: `Você é o assistente historiográfico principal do Clio Archive, atuando como um historiador profissional especializado em pesquisa, análise documental, crítica de fontes e escrita historiográfica.

SUA MISSÃO:
Ajudar o usuário a pesquisar com rigor, interpretar fontes, construir hipóteses e redigir textos históricos consistentes, transformando arquivos em conhecimento sólido.

PRINCÍPIOS FUNDAMENTAIS:
1. PRIORIDADE À FONTE: Baseie-se prioritariamente nos documentos e registros disponíveis. Diferencie fato, hipótese e interpretação.
2. RIGOR CIENTÍFICO: NUNCA invente informações. Se os dados forem insuficientes, indique lacunas documentais e sugira caminhos de investigação.
3. RACIOCÍNIO HISTORIOGRÁFICO: Considere contexto, relações de poder, temporalidade e limites da documentação.
4. CRÍTICA DAS FONTES: Considere quem produziu a fonte, quando, para quê e quais silenciamentos existem.

ESTILO E FORMATO:
- Tom: Claro, elegante, preciso, analítico e intelectualmente honesto.
- Formato de Resposta:
  1. RESPOSTA SINTÉTICA.
  2. BASE DOCUMENTAL.
  3. INTERPRETAÇÃO HISTORIOGRÁFICA.
  4. LIMITES OU LACUNAS.
  5. CAMINHOS DE PESQUISA.

Ao elaborar o projeto de pesquisa:
1. Título acadêmico.
2. Delimitação do tema.
3. Problema de pesquisa.
4. Objetivos (Geral e Específicos).
5. Justificativa.
6. Metodologia.
7. Fundamentação Teórica.
8. Resultados Esperados.

Retorne os dados em formato JSON estruturado.`
  });

  const response = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: `Elabore um projeto de pesquisa completo sobre o tema: ${theme}` }] }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING },
          theme: { type: SchemaType.STRING },
          problem: { type: SchemaType.STRING },
          objectives: {
            type: SchemaType.OBJECT,
            properties: {
              general: { type: SchemaType.STRING },
              specifics: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
            },
            required: ["general", "specifics"]
          },
          justification: { type: SchemaType.STRING },
          methodology: { type: SchemaType.STRING },
          theoreticalFramework: { type: SchemaType.STRING },
          expectedResults: { type: SchemaType.STRING }
        },
        required: ["title", "theme", "problem", "objectives", "justification", "methodology", "theoreticalFramework", "expectedResults"]
      }
    }
  });

  return JSON.parse(response.response.text());
}

async function getHistoriographyArticlesServer() {
  const model = ai.getGenerativeModel({ 
    model: "gemini-flash-latest",
    systemInstruction: `Você é um assistente historiográfico especializado em História do Brasil e curador de conteúdo acadêmico de excelência.
Seu objetivo é fornecer uma lista de 4 a 5 fontes fundamentais (artigos acadêmicos, capítulos de livros, textos clássicos) sobre metodologia historiográfica e teoria da história.

DIRETRIZES DE PESQUISA CIENTÍFICA:
1. Busque materiais confiáveis sobre: metodologia historiográfica, teoria da história, crítica documental, uso de fontes, escrita da história (historiografia) e construção do conhecimento histórico.
2. Priorize autores fundamentais (ex: Marc Bloch, Fernand Braudel, Edward Thompson, Carlo Ginzburg, Michel Foucault, Reinhart Koselleck, José D'Assunção Barros, Ciro Flamarion Cardoso).
3. Inclua temas como: análise de fontes primárias/secundárias, história-problema, narrativa, temporalidade, memória, arquivo e operação historiográfica.

Retorne os dados em formato JSON estruturado.`
  });

  const response = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: "Forneça artigos fundamentais sobre metodologia e teoria da pesquisa historiográfica." }] }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            title: { type: SchemaType.STRING },
            author: { type: SchemaType.STRING },
            url: { type: SchemaType.STRING },
            description: { type: SchemaType.STRING },
            type: { type: SchemaType.STRING },
            abntCitation: { type: SchemaType.STRING }
          },
          required: ["title", "url", "description", "type", "abntCitation"]
        }
      }
    }
  });

  return JSON.parse(response.response.text());
}

async function generateLessonPlanServer(theme: string, level: string, period: string) {
  const model = ai.getGenerativeModel({ 
    model: "gemini-flash-latest",
    systemInstruction: `Você é um assistente historiográfico e pedagógico do Clio Archive, especializado em criar planos de aula de História com alto rigor acadêmico e didática adaptada.
    
SUA MISSÃO:
Criar planos de aula estruturados para professores de História, seguindo as diretrizes da BNCC e garantindo a precisão dos fatos históricos.

DIRETRIZES:
1. RIGOR HISTÓRICO: Baseie-se em historiografia atualizada. NUNCA invente fatos ou interpretações sem base.
2. ADAPTAÇÃO: Ajuste a linguagem e a complexidade ao nível de ensino solicitado (Fundamental I, II ou Médio).
3. ESTRUTURA FIXA: O plano deve conter: Título, Objetivo, Habilidades (BNCC), Conteúdo, Duração, Metodologia, Recursos, Atividade, Avaliação e Conexão com Fontes.
4. AVISO: Sempre inclua o aviso: "Conteúdo gerado com apoio de IA. Recomenda-se revisão do professor."

Retorne os dados em formato JSON estruturado.`
  });

  const response = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: `Crie um plano de aula de História sobre o tema: ${theme}. Nível: ${level}. Período: ${period}.` }] }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING },
          objective: { type: SchemaType.STRING },
          bnccSkills: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          content: { type: SchemaType.STRING },
          duration: { type: SchemaType.STRING },
          methodology: { type: SchemaType.STRING },
          resources: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          activity: { type: SchemaType.STRING },
          evaluation: { type: SchemaType.STRING },
          historicalConnections: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          level: { type: SchemaType.STRING },
          period: { type: SchemaType.STRING }
        },
        required: ["title", "objective", "bnccSkills", "content", "duration", "methodology", "resources", "activity", "evaluation", "historicalConnections", "level", "period"]
      }
    }
  });

  const result = JSON.parse(response.response.text());
  result.id = Math.random().toString(36).substr(2, 9);
  return result;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || "" 
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Gemini API Endpoints
  app.post("/api/gemini/search", async (req, res) => {
    const { query } = req.body;
    try {
      const systemInstruction = `Você é o assistente historiográfico principal do Clio Archive...`; // Simplified for now, will use full version
      // Actually, I'll just proxy the call to a function that uses the SDK
      const result = await searchHistoricalSourcesServer(query);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/gemini/project", async (req, res) => {
    const { theme } = req.body;
    try {
      const result = await generateResearchProjectServer(theme);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/gemini/articles", async (req, res) => {
    try {
      const result = await getHistoriographyArticlesServer();
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/gemini/lesson-plan", async (req, res) => {
    const { theme, level, period } = req.body;
    try {
      const result = await generateLessonPlanServer(theme, level, period);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Mercado Pago Webhook
  app.post("/api/webhook", async (req, res) => {
    const { action, data } = req.body;
    
    // In a real app, you'd verify the signature and update Firestore
    if (action === "payment.created") {
      console.log("Payment created:", data.id);
    }
    
    res.sendStatus(200);
  });

  // API Routes
  app.post("/api/create-preference", async (req, res) => {
    const { userId, userEmail, planName, price } = req.body;

    try {
      const preference = new Preference(client);
      const result = await preference.create({
        body: {
          items: [
            {
              id: "clio-prof",
              title: `ClioArchive - Plano ${planName}`,
              quantity: 1,
              unit_price: Number(price),
              currency_id: "BRL",
            }
          ],
          payer: {
            email: userEmail,
          },
          back_urls: {
            success: `${req.headers.origin}/?status=success`,
            failure: `${req.headers.origin}/?status=failure`,
            pending: `${req.headers.origin}/?status=pending`,
          },
          auto_return: "approved",
          metadata: {
            userId: userId,
          },
          notification_url: `${process.env.APP_URL}/api/webhook`,
        }
      });

      res.json({ init_point: result.init_point });
    } catch (error: any) {
      console.error("Mercado Pago Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
