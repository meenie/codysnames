import { Player } from './player.types';

export const setPlayerDataRequest = (
  player: Player.Entity
): Player.SetPlayerDataRequest => ({
  type: Player.ActionTypes.SetPlayerDataRequest,
  player,
});

export const setPlayerDataComplete = (
  player: Player.Entity
): Player.SetPlayerDataComplete => ({
  type: Player.ActionTypes.SetPlayerDataComplete,
  player,
});

export const setPlayerDataError = (error: Error): Player.SetPlayerDataError => ({
  type: Player.ActionTypes.SetPlayerDataError,
  error,
});

export const signInPlayerRequest = (): Player.SignInPlayerRequest => ({
  type: Player.ActionTypes.SignInPlayerRequest,
});

export const signInPlayerComplete = (
  player: Player.Entity
): Player.SignInPlayerComplete => ({
  type: Player.ActionTypes.SignInPlayerComplete,
  player,
});

export const signInPlayerError = (error: Error): Player.SignInPlayerError => ({
  type: Player.ActionTypes.SignInPlayerError,
  error,
});

export const joinGameRequest = (gameId: string): Player.JoinGameRequest => ({
  type: Player.ActionTypes.JoinGameRequest,
  gameId,
});

export const joinGameComplete = (player: Player.Entity): Player.JoinGameComplete => ({
  type: Player.ActionTypes.JoinGameComplete,
  player,
});

export const joinGameError = (error: Error): Player.JoinGameError => ({
  type: Player.ActionTypes.JoinGameError,
  error,
});
