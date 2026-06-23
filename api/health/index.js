const { app } = require("@azure/functions");

app.http("health", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: async (request) => {
    const b = await request.json();
    const heart = Number(b.heart || 0);
    const sys = Number(b.systolic || 0);
    const dia = Number(b.diastolic || 0);
    const steps = Number(b.steps || 0);

    let status = "🟢 正常";
    let alert = false;
    let message = `心率 ${heart}，血壓 ${sys}/${dia}，步數 ${steps}。目前狀態穩定。`;

    if (heart > 110 || heart < 50 || sys > 150 || dia > 95) {
      status = "🔴 高風險";
      alert = true;
      message = `心率 ${heart}，血壓 ${sys}/${dia}。數值偏危險，建議立即通知家屬並視情況就醫。`;
    } else if (heart > 95 || sys > 135 || dia > 88 || steps < 1000) {
      status = "🟡 注意";
      message = `心率 ${heart}，血壓 ${sys}/${dia}，步數 ${steps}。建議多休息並持續觀察。`;
    }

    return { jsonBody: { status, message, alert } };
  }
});
