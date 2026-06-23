# AI 智慧高齡生活助理｜真正可部署版

## 功能
- 前端：長者 AI 聊天、語音輸入、語音朗讀、健康資料、用藥提醒、SOS、家屬端
- 後端：Azure Functions
- AI：OpenAI API 真實回覆

## 需要設定
到 Azure Static Web App → 設定 → 環境變數：
- OPENAI_API_KEY = 你的 OpenAI API Key
- OPENAI_MODEL = gpt-4o-mini

## 部署
1. 把整個專案上傳到 GitHub repo 根目錄
2. 確認 `.github/workflows/azure-static-web-apps-icy-sand-0dc967800.yml`
3. 到 GitHub Actions 重新執行
4. Azure Static Web App 網址即可開啟

## 重要
如果你的 Azure 產生的 secret 名稱不同，請打開 workflow，把：
AZURE_STATIC_WEB_APPS_API_TOKEN_ICY_SAND_0DC967800
改成你 GitHub Secrets 裡實際的名稱。
