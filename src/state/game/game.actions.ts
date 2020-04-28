import { Game } from './game.types';
import { Player } from '../player/player.types';

export const databasePushUpdate = (game: Game.Entity): Game.DatabasePushUpdate => ({
  type: Game.ActionTypes.DatabasePushUpdate,
  game,
});

export const createGameRequest = (): Game.CreateGameRequest => ({
  type: Game.ActionTypes.CreateGameRequest,
});

export const createGameComplete = (game: Game.Entity): Game.CreateGameComplete => ({
  type: Game.ActionTypes.CreateGameComplete,
  game,
});

export const createGameError = (error: Error): Game.CreateGameError => ({
  type: Game.ActionTypes.CreateGameError,
  error,
});

export const loadGameRequest = (gameId: string): Game.LoadGameRequest => ({
  type: Game.ActionTypes.LoadGameRequest,
  gameId,
});

export const loadGameComplete = (game: Game.Entity): Game.LoadGameComplete => ({
  type: Game.ActionTypes.LoadGameComplete,
  game,
});

export const loadGameError = (error: Error): Game.CreateGameError => ({
  type: Game.ActionTypes.CreateGameError,
  error,
});

export const joinGameRequest = (gameId: string): Game.JoinGameRequest => ({
  type: Game.ActionTypes.JoinGameRequest,
  gameId,
});

export const joinGameComplete = (game: Game.Entity): Game.JoinGameComplete => ({
  type: Game.ActionTypes.JoinGameComplete,
  game,
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
  game: Game.Entity,
  whoIsFirst: Game.TeamColor
): Game.StartGameComplete => ({
  type: Game.ActionTypes.StartGameComplete,
  game,
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

export const leaveGameComplete = (game: Game.Entity): Game.LeaveGameComplete => ({
  type: Game.ActionTypes.LeaveGameComplete,
  game,
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
