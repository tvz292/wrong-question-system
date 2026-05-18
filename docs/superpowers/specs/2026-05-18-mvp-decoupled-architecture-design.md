# 錯題管理系統 MVP 設計規格書 (2026-05-18)

## 1. 專案目標
構建一個輕量級、易於維護且具備自動化部署能力的「錯題管理系統」MVP。針對非技術背景的使用者，採用「開發簡單、線上穩定、運維自動化」的原則。

## 2. 系統架構 (System Architecture)
採用前後端分離架構，以確保擴展性與靈活性。

- **前端 (Frontend)**: Next.js (TypeScript)
  - 部署平台: Vercel
  - 職責: 處理使用者介面、路由、前端表單驗證、API 調用。
- **後端 (Backend)**: Express (TypeScript)
  - 部署平台: Render (或其他支援 Docker/Node.js 的 PaaS)
  - 職責: 處理業務邏輯 (Auth, CRUD)、資料庫交互、身份驗證、錯誤日誌。
- **資料庫 (Database)**: PostgreSQL
  - 託管平台: Neon (Serverless PostgreSQL)
  - 職責: 持久化存儲使用者、題目及錯題記錄。
- **資料庫工具 (ORM)**: Prisma
  - 職責: 管理 Schema、執行 Migration、提供型別安全的資料庫查詢。

## 3. 資料流向 (Data Flow)
1. 使用者透過瀏覽器訪問 Vercel 上的前端。
2. 前端透過 HTTPS 向 Render 上的 Express API 送出請求。
3. Express 後端使用 Prisma 連結至雲端的 Neon 數據庫。
4. 回傳處理結果至前端進行渲染。

## 4. 本地開發與環境 (Environment)
為了確保開發環境的一致性，我們在本地使用 Docker：
- **Docker Compose**: 運行一個本地 PostgreSQL 容器，供開發測試使用。
- **環境變數 (.env)**:
  - `DATABASE_URL`: 資料庫連線字串。
  - `JWT_SECRET`: 身份驗證密鑰。
  - `FRONTEND_URL`: 前端網址 (處理 CORS 跨域限制)。

## 5. 部署策略 (Deployment)
- **CI/CD**: 與 GitHub 連動。當程式碼推送到主分支 (main) 時，Vercel 與 Render 將自動執行構建與部署。
- **資料庫遷移 (Migrations)**:
  - 部署過程中，自動執行 `prisma migrate deploy` 以更新生產環境的資料庫結構。
- **安全性**:
  - 所有敏感變數 (API Keys, DB Credentials) 均存放在平台的環境變數設置中，嚴禁進入 Git。
  - 啟用 CORS 限制，僅允許授權的前端域名訪問 API。

## 6. 全方位思考點 (Considerations)
- **錯誤處理**: 後端將實作標準化的錯誤處理中間件，捕獲異常並回傳有意義的錯誤碼。
- **日誌追蹤**: 使用輕量級日誌工具 (如 `morgan`) 記錄 API 請求，便於後續排錯。
- **健康檢查**: 在後端提供 `/health` 端點，供 Render 監控服務狀態。
- **API 版本化**: 初期雖為 MVP，但 API 路由將以 `/api/v1` 開頭，預留未來擴充空間。

## 7. 驗證標準 (Success Criteria)
1. 前端可正常訪問，且能與後端通訊。
2. 資料能正確存入 Neon 資料庫並讀取。
3. 推送至 GitHub 後，線上版本能自動更新。
