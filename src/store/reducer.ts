import produce from 'immer';
import { Store } from './types';

export const blankPlayer: Store.Player = {
  id: '',
  name: '',
};
export const blankGame: Store.Game = {
  id: '',
  status: Store.Status.Open,
  turn: Store.TeamColor.Blue,
  doubleAgent: Store.TeamColor.Blue,
  blueSpymaster: blankPlayer,
  redSpymaster: blankPlayer,
  blueAgents: [],
  redAgents: [],
};

export const initialState: Store.ApplicationState = {
  loading: {
    cards: false,
    game: false,
    playerName: false,
    leavingGame: false,
    startingGame: false,
  },
  game: blankGame,
  player: blankPlayer,
  gameCards: [],
};

const reducer = (state = initialState, action: Store.ApplicationAction) => {
  switch (action.type) {
    case 'createGameCardsRequest':
    case 'joinGameCardsRequest':
      return produce(state, (draft) => {
        draft.loading.cards = true;
      });
    case 'createGameCardsSuccess':
    case 'joinGameCardsSuccess':
      return produce(state, (draft) => {
        draft.loading.cards = false;
      });
    case 'createGameRequest':
    case 'joinGameRequest':
      return produce(state, (draft) => {
        draft.loading.game = true;
      });
    case 'createGameSuccess':
    case 'joinGameSuccess':
      return produce(state, (draft) => {
        draft.loading.game = false;
        draft.player.currentGameId = action.gameId;
      });
    case 'createGameCardsError':
    case 'createGameError':
    case 'joinGameError':
      return produce(state, (draft) => {
        draft.loading.game = false;
        console.error(action.error);
      });
    case 'setPlayerNameRequest':
      return produce(state, (draft) => {
        draft.loading.playerName = true;
      });
    case 'setPlayerNameSuccess':
      return produce(state, (draft) => {
        draft.loading.playerName = false;
        draft.player.name = action.name;
      });
    case 'setPlayerNameError':
      return produce(state, (draft) => {
        draft.loading.playerName = false;
        console.error(action.error);
      });
    case 'setPlayerData':
      return produce(state, (draft) => {
        draft.player = action.player;
      });
    case 'setGameData':
      return produce(state, (draft) => {
        draft.game = action.game;
      });
    case 'setGameCardsData':
      return produce(state, (draft) => {
        draft.gameCards = action.gameCards;
      });
    case 'leaveGameRequest':
      return produce(state, (draft) => {
        draft.loading.leavingGame = true;
      });
    case 'leaveGameSuccess':
      return produce(state, (draft) => {
        draft.loading.leavingGame = false;
        draft.game = blankGame;
        draft.player.currentGameId = '';
        draft.gameCards = [];
      });
    case 'startGameRequest':
      return produce(state, (draft) => {
        draft.loading.startingGame = true;
      });
    case 'startGameSuccess':
      return produce(state, (draft) => {
        draft.loading.startingGame = false;
      });
    case 'gameOver':
      return produce(state, (draft) => {
        if (draft.game) {
          draft.game.status = Store.Status.Over;
          draft.game.whoWon = action.whoWon;
        }
      });
    default:
      return state;
  }
};

export default reducer;
