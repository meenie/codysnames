import { Action } from 'redux';
import { ApolloClient } from 'apollo-client';
import { NormalizedCacheObject } from 'apollo-cache-inmemory';

export namespace Apollo {
  export interface State {
    client?: Entity;
  }

  export type Entity = ApolloClient<NormalizedCacheObject>;

  export enum ActionTypes {
    SetClient = 'Apollo: Set Apollo Client',
  }

  export interface SetClient extends Action {
    type: ActionTypes.SetClient;
    client: Entity;
  }

  export type Actions = SetClient;
}
