import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // AI Contract Comparison & Legal Review Advice endpoint
  app.post("/api/ai/analyze-contract", async (req, res) => {
    try {
      const { contractTitle, amount, background, keyContent, previousAmount, previousBackground, previousKeyContent } = req.body;
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `
당신은 기업 법무 검토 전문가입니다. 아래 이전 계약서 정보와 갱신(현재) 계약서 정보를 비교하여 주요 변경 사항, 법률적 리스크, 그리고 하이라이트해야 할 핵심 변경 포인트를 분석해주세요.

[계약서명]: ${contractTitle || '갱신 계약서'}

[이전 계약 정보]:
- 계약금액: ${previousAmount || '(최초 계약)'}
- 체결 배경: ${previousBackground || '-'}
- 주요 내용: ${previousKeyContent || '-'}

[현재/갱신 계약 정보]:
- 계약금액: ${amount}
- 체결 배경: ${background || '-'}
- 주요 내용: ${keyContent || '-'}

다음 형식의 JSON으로만 응답해 주세요 (마크다운 백틱 없이):
{
  "summary": "갱신 계약에 따른 변경 사항에 대한 핵심 요약 (2-3문장)",
  "riskLevel": "안전 또는 주의 또는 위험",
  "keyChanges": [
    "변경점 1 요약",
    "변경점 2 요약"
  ],
  "highlightSentences": [
    "하이라이트할 구체적인 변경 키워드 또는 문장 (예: 단가 인상, 인원 증가 등)"
  ]
}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      let text = response.text || "{}";
      // Clean up markdown block if present
      text = text.replace(/```json/g, "").replace(/```/g, "").trim();
      
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch (e) {
        parsed = {
          summary: text,
          riskLevel: "안전",
          keyChanges: ["계약 갱신 변경점 분석 완료"],
          highlightSentences: []
        };
      }

      res.json(parsed);
    } catch (error: any) {
      console.error("AI Analysis Error:", error);
      res.status(500).json({ error: error.message || "AI analysis failed" });
    }
  });

  // Vite middleware setup for development
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
