import { GameClue } from './gameClue.types';

export const databasePushUpdate = (gameClues: GameClue.Entity[]) => ({
  type: GameClue.ActionTypes.DatabasePushUpdate,
  gameClues,
});

export const createGameClueRequest = (
  gameClue: Omit<GameClue.Entity, 'id'>
): GameClue.CreateClueRequest => ({
  type: GameClue.ActionTypes.CreateClueRequest,
  gameClue,
});

export const createGameClueComplete = (
  gameClue: GameClue.Entity
): GameClue.CreateClueComplete => ({
  type: GameClue.ActionTypes.CreateClueComplete,
  gameClue,
});

export const createGameClueError = (error: Error): GameClue.CreateClueError => ({
  type: GameClue.ActionTypes.CreateClueError,
  error,
});
