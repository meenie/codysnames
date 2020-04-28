import { GameCard } from './gameCard.types';
import produce from 'immer';

export const blankGameCards = { cards: [], cardStates: [] };

export const gameCardsInitialState: GameCard.State = {
  loaded: false,
  loading: false,
  data: blankGameCards,
  error: false,
  errors: [],
};

const reducer = (state = gameCardsInitialState, action: GameCard.Actions) => {
  switch (action.type) {
    case GameCard.ActionTypes.DatabasePushGameCardUpdate:
      return produce(state, (draft) => {
        draft.data.cards = action.gameCards;
      });
    case GameCard.ActionTypes.DatabasePushGameCardStateUpdate:
      return produce(state, (draft) => {
        draft.data.cardStates = action.gameCardStates;
      });
    case GameCard.ActionTypes.UnloadGameCards:
      return produce(state, (draft) => {
        draft.loaded = false;
        draft.data = blankGameCards;
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
        draft.data = blankGameCards;
      });
    default:
      return state;
  }
};

export default reducer;
