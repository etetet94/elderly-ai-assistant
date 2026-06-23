const { app } = require("@azure/functions");
const OpenAI = require("openai");

app.http("chat", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: async (request, context) => {
    try {
      const body = await request.json();
      const message = body.message || "";
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const completion = await client.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "你是一位溫柔、耐心、簡單易懂的高齡生活助理。回答請用繁體中文，語氣像家人，避免醫療診斷；遇到危急狀況請建議立即聯絡家屬或119。"
          },
          { role: "user", content: message }
        ],
        temperature: 0.7
      });
      return { jsonBody: { reply: completion.choices[0].message.content } };
    } catch (err) {
      context.error(err);
      return { status: 500, jsonBody: { reply: "AI 服務連線失敗，請確認 OPENAI_API_KEY 是否已設定。" } };
    }
  }
});
