import produce from 'immer';

import { Game } from './game.types';
import { blankPlayer } from '../player/player.reducer';
import { GameCard } from '../gameCard/gameCard.types';

export const blankGame: Game.Entity = {
  id: '',
  status: Game.Status.Open,
  turn: Game.TeamColor.Blue,
  double_agent: Game.TeamColor.Blue,
  blue_spymaster: blankPlayer,
  red_spymaster: blankPlayer,
  blue_agents: [],
  red_agents: [],
  blue_has_extra_guess: false,
  red_has_extra_guess: false,
  number_of_guesses: -1,
  created_at: new Date(),
  updated_at: new Date(),
  cards: [],
  clues: [],
};

export const gameInitialState: Game.State = {
  loading: false,
  loaded: false,
  creating: false,
  created: false,
  joining: false,
  joined: false,
  starting: false,
  started: false,
  leaving: false,
  left: false,
  flippingCard: false,
  data: blankGame,
  error: false,
  errors: [],
};

const setDefaults = (game: Game.Entity) => {
  return produce(game, (draft) => {
    // @ts-ignore
    delete draft.__typename;
    if (!draft.red_spymaster) {
      draft.red_spymaster = blankPlayer;
    }
    if (!draft.blue_spymaster) {
      draft.blue_spymaster = blankPlayer;
    }
    draft.cards = draft.cards.map((card) => {
      if (!card.state) {
        return {
          ...card,
          state: {
            id: card.game_card_state_id,
            game_id: card.game_id,
            type: GameCard.CardType.Unkown,
            flipped: false,
          },
        };
      } else {
        return card;
      }
    });
  });
};

const reducer = (state = gameInitialState, action: Game.Actions) => {
  switch (action.type) {
    case Game.ActionTypes.DatabasePushUpdate:
    case Game.ActionTypes.GameStateUpdated:
      return produce(state, (draft) => {
        draft.data = setDefaults(action.game);
        draft.loaded = true;
        draft.flippingCard = false;
      });
    case Game.ActionTypes.LeaveGameRequest:
      return produce(state, (draft) => {
        draft.leaving = true;
        draft.loaded = false;
        draft.error = false;
        draft.errors = [];
      });
    case Game.ActionTypes.LeaveGameComplete:
      return produce(state, (draft) => {
        draft.leaving = false;
        draft.left = true;
        draft.data = setDefaults(action.game);
      });
    case Game.ActionTypes.StartGameRequest:
      return produce(state, (draft) => {
        draft.starting = true;
        draft.error = false;
        draft.errors = [];
      });
    case Game.ActionTypes.StartGameComplete:
      return produce(state, (draft) => {
        draft.starting = false;
        draft.started = true;
        draft.loaded = true;
        draft.data = setDefaults(action.game);
      });
    case Game.ActionTypes.CreateGameRequest:
      return produce(state, (draft) => {
        draft.creating = true;
        draft.error = false;
        draft.errors = [];
      });
    case Game.ActionTypes.CreateGameComplete:
      return produce(state, (draft) => {
        draft.creating = false;
        draft.created = true;
        draft.loaded = true;
        draft.data = setDefaults(action.game);
      });
    case Game.ActionTypes.JoinGameRequest:
      return produce(state, (draft) => {
        draft.joining = true;
        draft.error = false;
        draft.errors = [];
      });
    case Game.ActionTypes.JoinGameComplete:
      return produce(state, (draft) => {
        draft.joining = false;
        draft.joined = true;
        draft.loaded = true;
        draft.data = setDefaults(action.game);
      });
    case Game.ActionTypes.LoadGameRequest:
      return produce(state, (draft) => {
        draft.loading = true;
        draft.error = false;
        draft.errors = [];
      });
    case Game.ActionTypes.LoadGameComplete:
      return produce(state, (draft) => {
        draft.loading = false;
        draft.loaded = true;
        draft.data = setDefaults(action.game);
      });
    case Game.ActionTypes.FlipCardRequest:
      return produce(state, (draft) => {
        draft.flippingCard = true;
      });
    case Game.ActionTypes.FlipCardComplete:
      return produce(state, (draft) => {
        draft.flippingCard = false;
      });
    case Game.ActionTypes.CreateGameError:
    case Game.ActionTypes.JoinGameError:
    case Game.ActionTypes.LeaveGameError:
    case Game.ActionTypes.StartGameError:
    case Game.ActionTypes.LoadGameError:
      return produce(state, (draft) => {
        draft.loading = false;
        draft.loaded = false;
        draft.creating = false;
        draft.created = false;
        draft.joining = false;
        draft.joined = false;
        draft.starting = false;
        draft.starting = false;
        draft.leaving = false;
        draft.left = false;
        draft.flippingCard = false;
        draft.error = true;
        draft.errors.push(action.error);
        draft.data = blankGame;
      });
    default:
      return state;
  }
};

export default reducer;
