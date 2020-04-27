import { GameCard } from './gameCard.types';
import produce from 'immer';

export const gameCardsInitialState: GameCard.State = {
  loaded: false,
  loading: false,
  data: { cards: [], cardStates: [] },
  error: false,
  errors: [],
};

const reducer = (state = gameCardsInitialState, action: GameCard.Actions) => {
  switch (action.type) {
    case GameCard.ActionTypes.SetGameCardsData:
      return produce(state, (draft) => {
        draft.data.cards = action.gameCards;
      });
    case GameCard.ActionTypes.SetGameCardStatesData:
      return produce(state, (draft) => {
        draft.data.cardStates = action.gameCardStates;
      });
    case GameCard.ActionTypes.CreateGameCardsRequest:
      return produce(state, (draft) => {
        draft.loaded = false;
        draft.loading = true;
        draft.error = false;
        draft.errors = [];
      });
    case GameCard.ActionTypes.CreateGameCardsComplete:
      return produce(state, (draft) => {
        draft.loaded = true;
        draft.loading = false;
        draft.error = false;
        draft.errors = [];
      });
    case GameCard.ActionTypes.CreateGameCardsError:
      return produce(state, (draft) => {
        draft.loaded = false;
        draft.loading = false;
        draft.error = true;
        draft.errors.push(action.error);
      });
    default:
      return state;
  }
};

export default reducer;
