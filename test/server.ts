import { serve } from "@hono/node-server";
import { graphql, buildSchema } from "graphql";
import { Hono } from "hono";
import { explorer } from "../src/html/index.js";

const app = new Hono();

// 簡易的なGraphQLスキーマ定義
const schema = buildSchema(`
  type Query {
    hello: String
    ping: String
  }
`);

// リゾルバーの実装
const rootValue = {
  hello: () => "Hello from Hono & GraphQL!",
  ping: () => "pong",
};

// GraphQLのエンドポイント
app.post("/graphql", async (c) => {
  const body = await c.req.json();
  const response = await graphql({
    schema,
    source: body.query,
    rootValue,
    variableValues: body.variables,
    operationName: body.operationName,
  });
  return c.json(response);
});

// Apollo Explorerをサーブするエンドポイント
app.get("/", (c) => {
  const html = explorer({
    endpointUrl: "/graphql",
    persistExplorerState: false,
    introspectionInterval: 5000, // 5秒ごとにイントロスペクション
  });
  return c.html(html);
});

const port = Number(process.env.PORT || 3000);
console.log(`Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
