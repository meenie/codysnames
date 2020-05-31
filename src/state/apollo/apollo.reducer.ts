import { Apollo } from './apollo.types';

export const apolloInitialState: Apollo.State = {};

const reducer = (state = apolloInitialState, action: Apollo.Actions) => {
  switch (action.type) {
    case Apollo.ActionTypes.SetClient:
      return {
        client: action.client,
      };
    default:
      return state;
  }
};

export default reducer;
