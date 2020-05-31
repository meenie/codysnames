const HASURA_GRAPHQL_ENGINE_HOSTNAME = process.env.REACT_APP_GRAPHQL_HOSTNAME;

export const GRAPHQL_URL = `https://${HASURA_GRAPHQL_ENGINE_HOSTNAME}/v1/graphql`;
export const REALTIME_GRAPHQL_URL = `wss://${HASURA_GRAPHQL_ENGINE_HOSTNAME}/v1/graphql`;