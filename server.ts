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
    systemInstruction: `Você é o assistente historiográfico principal do Clio Archive, um historiador profissional e arquivista digital de elite.
SUA MISSÃO: Localizar fontes históricas primárias e secundárias com o mais alto rigor científico e acadêmico.

DIRETRIZES DE PESQUISA E VERACIDADE:
1. TOLERÂNCIA ZERO PARA ALUCINAÇÕES: NUNCA invente links ou fontes. Se não tiver certeza absoluta de um URL, NÃO o forneça.
2. FONTES REAIS E VERIFICÁVEIS: Priorize links estáveis de repositórios oficiais:
   - SciELO, JSTOR, Google Acadêmico (artigos verificados).
   - BNDigital (Biblioteca Nacional), Arquivo Nacional, Hemeroteca Digital.
   - Repositórios institucionais de universidades (USP, UNICAMP, UFRJ, Harvard, Oxford, etc.).
   - Archive.org (apenas para documentos digitalizados de fontes primárias).
3. PROTOCOLO PARA LINKS AUSENTES: Se um documento for fundamental mas não possuir link direto estável, você DEVE deixar o campo 'url' vazio e fornecer no campo 'description' as instruções precisas de localização física ou digital (ex: "Disponível no Arquivo Público do Estado de SP, Fundo Deops, Prontuário X").
4. ANÁLISE CRÍTICA PROFUNDA: Explique o viés, a intencionalidade e o contexto de produção. Use terminologia técnica correta.
5. CITAÇÃO ABNT: Forneça a citação impecável segundo a NBR 6023:2018.

ESTILO: Erudito, preciso e analítico.`
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
    systemInstruction: `Você é um curador de conteúdo acadêmico de excelência, especializado em Teoria da História e Metodologia Historiográfica.
Seu objetivo é fornecer uma lista de 4 a 5 fontes fundamentais e incontestáveis.

DIRETRIZES DE RIGOR CIENTÍFICO:
1. AUTORES CANÔNICOS: Priorize a "Escola dos Annales", Nova História Cultural, Materialismo Histórico e autores contemporâneos de referência.
2. LINKS REAIS: Forneça URLs apenas para repositórios acadêmicos legítimos (SciELO, JSTOR, Repositórios de Universidades). 
3. VERIFICAÇÃO DE LINKS: É terminantemente proibido inventar URLs. Se o artigo for clássico mas não estiver em um repositório aberto com link direto, deixe o campo 'url' vazio e indique onde pode ser consultado.
4. CITAÇÃO ABNT: Use o padrão NBR 6023 rigorosamente.`
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
    systemInstruction: `Você é um assistente historiográfico e pedagógico sênior do Clio Archive.
    
SUA MISSÃO:
Criar planos de aula de História com absoluto rigor factual e historiográfico.

DIRETRIZES DE VERACIDADE:
1. FONTES E CONEXÕES: Ao sugerir conexões com fontes históricas, utilize apenas documentos REAIS e conhecidos. Não invente fontes primárias.
2. RIGOR HISTÓRICO: Evite anacronismos e interpretações sem base documental.
3. BNCC: Alinhamento rigoroso com as competências e habilidades da Base Nacional Comum Curricular.
4. AVISO OBRIGATÓRIO: "Conteúdo gerado com apoio de IA. Recomenda-se revisão do professor."`
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
