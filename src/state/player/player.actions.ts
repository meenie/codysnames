import { Player } from './player.types';

export const setPlayerData = (player: Player.Entity): Player.SetPlayerData => ({
  type: Player.ActionTypes.SetPlayerData,
  player,
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
