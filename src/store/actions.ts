import { Store } from './types';

export const createGameRequest = (): Store.CreateGameRequest => ({
  type: 'createGameRequest',
});

export const createGameSuccess = (gameId: string): Store.CreateGameSuccess => ({
  type: 'createGameSuccess',
  gameId,
});

export const createGameError = (error: Error): Store.CreateGameError => ({
  type: 'createGameError',
  error,
});

export const joinGameRequest = (): Store.JoinGameRequest => ({
  type: 'joinGameRequest',
});

export const joinGameSuccess = (gameId: string): Store.JoinGameSuccess => ({
  type: 'joinGameSuccess',
  gameId,
});

export const joinGameError = (error: Error): Store.JoinGameError => ({
  type: 'joinGameError',
  error,
});

export const createGameCardsRequest = (): Store.CreateGameCardsRequest => ({
  type: 'createGameCardsRequest',
});

export const createGameCardsSuccess = (): Store.CreateGameCardsSuccess => ({
  type: 'createGameCardsSuccess',
});

export const createGameCardsError = (error: Error): Store.CreateGameCardsError => ({
  type: 'createGameCardsError',
  error,
});

export const joinGameCardsRequest = (): Store.JoinGameCardsRequest => ({
  type: 'joinGameCardsRequest',
});

export const joinGameCardsSuccess = (): Store.JoinGameCardsSuccess => ({
  type: 'joinGameCardsSuccess',
});

export const joinGameCardsError = (error: Error): Store.JoinGameError => ({
  type: 'joinGameError',
  error,
});

export const setPlayerNameRequest = (): Store.SetPlayerNameRequest => ({
  type: 'setPlayerNameRequest',
});

export const setPlayerNameSuccess = (name: string): Store.SetPlayerNameSuccess => ({
  type: 'setPlayerNameSuccess',
  name,
});

export const setPlayerNameError = (error: Error): Store.SetPlayerNameError => ({
  type: 'setPlayerNameError',
  error,
});

export const setGameData = (game: Store.Game): Store.SetGameData => ({
  type: 'setGameData',
  game,
});

export const setGameCardsData = (
  gameCards: Store.GameCard[]
): Store.SetGameCardsData => ({
  type: 'setGameCardsData',
  gameCards,
});

export const setUserId = (userId: string): Store.SetUserId => ({
  type: 'setUserId',
  userId,
});

export const setPlayerData = (player: Store.Player): Store.SetPlayerData => ({
  type: 'setPlayerData',
  player,
});

export const leaveGameSuccess = (): Store.LeaveGameSuccess => ({
  type: 'leaveGameSuccess',
});

export const leaveGameRequest = (): Store.LeaveGameRequest => ({
  type: 'leaveGameRequest',
});

export const startGameSuccess = (): Store.StartGameSuccess => ({
  type: 'startGameSuccess',
});

export const startGameRequest = (): Store.StartGameRequest => ({
  type: 'startGameRequest',
});

export const gameOver = (whoWon: Store.TeamColor): Store.GameOver => ({
  type: 'gameOver',
  whoWon,
});
