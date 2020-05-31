import { Apollo } from './apollo.types';

export const setClient = (client: Apollo.Entity) => ({
  type: Apollo.ActionTypes.SetClient,
  client,
});
