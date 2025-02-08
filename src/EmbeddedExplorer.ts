/**
 * Configuration object containing optional settings and state
 * @property {boolean} persistExplorerState - Whether to maintain explorer state across reloads
 * @property {string} schema - Predefined GraphQL schema
 * @property {InitialState} initialState - Initial state for the embedded explorer
 * @property {string} endpointUrl - The target GraphQL endpoint URL
 * @property {?number} introspectionInterval - Interval (ms) to refresh schema introspection
 * @property {?RequestInit} requestInit - Custom fetch request options
 */
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

export declare class EmbeddedExplorer {
  constructor(params: {
    persistExplorerState?: boolean;
    schema?: string;
    endpointUrl?: string;
    target: string | HTMLElement;
    initialState?: InitialState;
    handleRequest?: typeof fetch;
  });
}
