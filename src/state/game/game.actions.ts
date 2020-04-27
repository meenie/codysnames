import { Game } from './game.types';
import { Player } from '../player/player.types';

export const setGameData = (game: Game.Entity): Game.SetGameData => ({
  type: Game.ActionTypes.SetGameData,
  game,
});

export const createGameRequest = (): Game.CreateGameRequest => ({
  type: Game.ActionTypes.CreateGameRequest,
});

export const createGameComplete = (gameId: string): Game.CreateGameComplete => ({
  type: Game.ActionTypes.CreateGameComplete,
  gameId,
});

export const createGameError = (error: Error): Game.CreateGameError => ({
  type: Game.ActionTypes.CreateGameError,
  error,
});

export const joinGameRequest = (gameId: string): Game.JoinGameRequest => ({
  type: Game.ActionTypes.JoinGameRequest,
  gameId,
});

export const joinGameComplete = (gameId: string): Game.JoinGameComplete => ({
  type: Game.ActionTypes.JoinGameComplete,
  gameId,
});

export const joinGameError = (error: Error): Game.JoinGameError => ({
  type: Game.ActionTypes.JoinGameError,
  error,
});

export const startGameRequest = (gameId: string): Game.StartGameRequest => ({
  type: Game.ActionTypes.StartGameRequest,
  gameId,
});

export const startGameComplete = (
  gameId: string,
  whoIsFirst: Game.TeamColor
): Game.StartGameComplete => ({
  type: Game.ActionTypes.StartGameComplete,
  gameId,
  whoIsFirst,
});

export const startGameError = (error: Error): Game.StartGameError => ({
  type: Game.ActionTypes.StartGameError,
  error,
});

export const leaveGameRequest = (gameId: string): Game.LeaveGameRequest => ({
  type: Game.ActionTypes.LeaveGameRequest,
  gameId,
});

export const leaveGameComplete = (gameId: string): Game.LeaveGameComplete => ({
  type: Game.ActionTypes.LeaveGameComplete,
  gameId,
});

export const leaveGameError = (error: Error): Game.LeaveGameError => ({
  type: Game.ActionTypes.LeaveGameError,
  error,
});

export const switchTeamsRequest = (): Game.SwitchTeamsRequest => ({
  type: Game.ActionTypes.SwitchTeamsRequest,
});

export const switchTeamsComplete = (): Game.SwitchTeamsComplete => ({
  type: Game.ActionTypes.SwitchTeamsComplete,
});

export const switchTeamsError = (error: Error): Game.SwitchTeamsError => ({
  type: Game.ActionTypes.SwitchTeamsError,
  error,
});

export const promoteToSpymasterRequest = (
  player: Player.Entity
): Game.PromoteToSpymasterRequest => ({
  type: Game.ActionTypes.PromoteToSpymasterRequest,
  player,
});

export const promoteToSpymasterComplete = (): Game.PromoteToSpymasterComplete => ({
  type: Game.ActionTypes.PromoteToSpymasterComplete,
});

export const promoteToSpymasterError = (error: Error): Game.PromoteToSpymasterError => ({
  type: Game.ActionTypes.PromoteToSpymasterError,
  error,
});

export const endTurnRequest = (): Game.EndTurnRequest => ({
  type: Game.ActionTypes.EndTurnRequest,
});

export const endTurnComplete = (): Game.EndTurnComplete => ({
  type: Game.ActionTypes.EndTurnComplete,
});

export const endTurnError = (error: Error): Game.EndTurnError => ({
  type: Game.ActionTypes.EndTurnError,
  error,
});
