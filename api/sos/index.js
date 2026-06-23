const { app } = require("@azure/functions");

app.http("sos", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: async (request) => {
    const body = await request.json();
    const name = body.name || "長者";
    const time = body.time || new Date().toISOString();

    // 真正寄 Email 可接 SendGrid、Resend 或 Gmail SMTP。
    // 目前先回傳雲端 API 通報成功，前端會寫入家屬端紀錄。
    return {
      jsonBody: {
        message: `${name} 已於 ${time} 觸發緊急求救，家屬端已收到通知紀錄。`
      }
    };
  }
});
