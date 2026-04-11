import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { MercadoPagoConfig, Preference } from "mercadopago";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || "" 
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

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
