const { explorer } = require("../dist/cjs/html/index.js");
const fs = require("fs");
const path = require("path");

// 動作確認用のHTMLを生成するスクリプト
// パブリックなGraphQLエンドポイント（Countries API）を設定しています。
const htmlContent = explorer({
  endpointUrl: "https://countries.trevorblades.com/graphql",
  introspectionInterval: 0,
  initialState: {
    document: `query GetCountries {
  countries {
    code
    name
    emoji
  }
}`,
  },
});

const outputPath = path.join(__dirname, "test-explorer.html");
fs.writeFileSync(outputPath, htmlContent, "utf-8");
console.log(`[Success] HTMLファイルを生成しました: ${outputPath}`);
console.log("ブラウザでこのファイルを開き、Apollo Explorerが正常に描画されることを確認してください。");
