"use client";
import { getIntrospectionQuery, buildClientSchema, printSchema } from "graphql";
import { useEffect, useRef } from "react";
import React from "react";
import type { EmbeddedExplorer, InitialState } from "./EmbeddedExplorer.js";

type GlobalThis = typeof globalThis & {
  EmbeddedExplorer: typeof EmbeddedExplorer;
};

const embedUrl = "https://explorer.embed.apollographql.com";
const explorerUrl =
  "https://embeddable-explorer.cdn.apollographql.com/_latest/explorer.umd.production.min.js";

/**
 * Fetches the GraphQL schema from a given URL.
 * @param url - The URL to fetch the schema from.
 * @param requestInit - Optional `RequestInit` object for customizing the fetch request.
 * @returns The fetched GraphQL schema as a string.
 * * @throws An error if the fetch fails.
 */
const fetchSchema = async (url: string, requestInit?: RequestInit) => {
  const response = await fetch(url, {
    ...requestInit,
    method: "POST",
    headers: {
      ...requestInit?.headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: getIntrospectionQuery(),
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch schema");
  }

  const data = await response.json();
  return printSchema(buildClientSchema(data));
};

/**
 * A React component that renders an Apollo Embedded Explorer for a GraphQL endpoint.
 * This component dynamically loads the embedded explorer iframe and handles schema introspection.
 *
 * @component
 * @param {string} props.explorer.endpointUrl - The URL of the GraphQL endpoint to explore.
 * @param {boolean} [props.explorer.persistExplorerState=false] - Whether to persist the explorer state across sessions.
 * @param {string} [props.explorer.schema] - A pre-defined schema to use instead of fetching one from the endpoint.
 * @param {number} [props.explorer.introspectionInterval=30000] - The interval (in milliseconds) at which to perform schema introspection.
 * @param {RequestInit} [props.explorer.requestInit] - Optional `RequestInit` object for customizing the fetch request.
 * @param {InitialState} props.explorer.initialState - Initial state for the embedded explorer.
 * @returns {JSX.Element} The rendered Apollo Embedded Explorer component.
 */
export const ApolloExplorer = ({
  explorer,
  ...props
}: {
  explorer: {
    persistExplorerState?: boolean;
    schema?: string;
    endpointUrl: string;
    introspectionInterval?: number;
    requestInit?: RequestInit;
    initialState: InitialState;
  };
} & React.HTMLAttributes<HTMLDivElement>) => {
  const {
    persistExplorerState,
    schema,
    initialState,
    endpointUrl,
    introspectionInterval,
    requestInit,
  } = explorer;

  const ref = useRef<HTMLDivElement>(null);
  const property = useRef<{
    isInitialized?: boolean;
  }>({}).current;
  useEffect(() => {
    const target = ref.current;
    if (target) {
      const init = () => {
        const node = ref.current?.querySelector<HTMLIFrameElement>(
          "iframe#apollo-embedded-explorer"
        );
        if (!node) {
          new (globalThis as GlobalThis).EmbeddedExplorer({
            target,
            persistExplorerState,
            initialState: {
              ...initialState,
              document: initialState.document ?? "",
            },
            endpointUrl,
            schema: schema ?? "",
            handleRequest: (url, option) =>
              fetch(url, { ...option, ...requestInit }),
          });
        }
      };
      property.isInitialized = true;
      if (typeof (globalThis as GlobalThis).EmbeddedExplorer === "undefined") {
        const script = window.document.createElement("script");
        script.src = explorerUrl;
        script.onload = () => {
          init();
        };
        window.document.head.appendChild(script);
      } else {
        init();
      }
    }
  }, [
    schema,
    endpointUrl,
    requestInit,
    property,
    initialState,
    persistExplorerState,
  ]);

  useEffect(() => {
    const target = ref.current;
    if (target && introspectionInterval) {
      const requestSchema = () => {
        const node = target.querySelector<HTMLIFrameElement>(
          "iframe#apollo-embedded-explorer"
        );
        fetchSchema(endpointUrl, requestInit).then((schema) => {
          if (node?.contentWindow) {
            node.contentWindow.postMessage(
              {
                name: "SchemaResponse",
                schema,
              },
              embedUrl
            );
          }
        });
      };
      const handle = setInterval(requestSchema, introspectionInterval);
      requestSchema();
      return () => {
        clearInterval(handle);
      };
    }
  }, [introspectionInterval, endpointUrl, requestInit]);

  useEffect(() => {
    if (ref.current) {
      const node = ref.current.querySelector<HTMLIFrameElement>(
        "iframe#apollo-embedded-explorer"
      );
      if (node) {
        return () => node.remove();
      }
    }
  }, []);

  return <div ref={ref} {...props} />;
};
