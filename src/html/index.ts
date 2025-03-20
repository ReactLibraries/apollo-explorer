import { printSchema, type GraphQLSchema } from "graphql";

export type InitialState = {
  document?: string;
  displayOptions?: {
    showHeadersAndEnvVars?: boolean;
    docsPanelState?: "open" | "closed";
    theme?: "light" | "dark";
  };
  headers?: Record<string, string>;
  variables?: Record<string, string>;
  collectionId?: string;
  operationId?: string;
};

export const explorer = ({
  persistExplorerState,
  schema,
  endpointUrl,
  introspectionInterval = 0,
  requestInit = {},
  initialState = {},
}: {
  persistExplorerState?: boolean;
  schema?: GraphQLSchema;
  endpointUrl: string;
  introspectionInterval?: number;
  requestInit?: RequestInit;
  initialState?: InitialState;
}) => {
  const schemaString =
    schema && printSchema(schema).replace(/'/g, "\\'").replace(/`/g, "\\`");
  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Embedded Explorer</title>
    <script async src="https://embeddable-explorer.cdn.apollographql.com/_latest/embeddable-explorer.umd.production.min.js"></script>
  </head>
  <body style="margin: 0; overflow-x: hidden; overflow-y: hidden; height: 100vh; width: 100vw" id="explorer"></body>
    <script type="module">
      import { getIntrospectionQuery, buildClientSchema, printSchema } from 'https://cdn.skypack.dev/graphql';
      const explorer = new EmbeddedExplorer({
        target: '#explorer',
        persistExplorerState: ${persistExplorerState},
        initialState:${JSON.stringify(initialState)},
        endpointUrl: '${endpointUrl}',
        schema: '${schemaString ?? ""}',
        handleRequest:(url, option) =>
          fetch(url, { ...option, credentials: "same-origin" })
        ,
      });
      console.log(explorer)

      const requestSchema = () => {
        const fetchSchema = async (url, requestInit) => {
          const response = await fetch(url, {
                ...requestInit,
                method: "POST",
                headers: {
                    ...requestInit === null || requestInit === void 0 ? void 0 : requestInit.headers,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    query: getIntrospectionQuery(),
                }),
            });
            if (!response.ok) {
                throw new Error("Failed to fetch schema");
            }
            const {data} = await response.json();
            return printSchema(buildClientSchema(data));
        };
      const node = explorer.embeddedExplorerIFrameElement;
      fetchSchema("${endpointUrl}", ${JSON.stringify(
    requestInit
  )}).then((schema) => {
              node.contentWindow.postMessage({
                      name: "SchemaResponse",
                      schema,
                  }, explorer.getEmbeddedExplorerURL());
              }
          );
      };
      if(${introspectionInterval}){
        setInterval(requestSchema, ${introspectionInterval});
        window.addEventListener("message", (message) => {
        console.log(message)
          const {data} = message;
          if(data.name==="ExplorerListeningForSchema"){
            requestSchema();
          }
        })
      }
    </script>
  </body>
</html>
`;
  return html;
};
