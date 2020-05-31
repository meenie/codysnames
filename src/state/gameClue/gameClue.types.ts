import { Action } from 'redux';
import { Game } from '../game/game.types';

export namespace GameClue {
  export interface State {
    loaded: boolean;
    loading: boolean;
    error: boolean;
    errors: Error[];
    data: Entity[];
  }

  export interface Entity {
    id: string;
    game_id: string;
    clue: string;
    number_of_guesses: number;
    color: Game.TeamColor;
  }

  export enum ActionTypes {
    DatabasePushUpdate = 'GameClue: Update game clue data from real-time database push',
    CreateClueRequest = 'GameClue: Request to create clue',
    CreateClueComplete = 'GameClue: Successfully created clue',
    CreateClueError = 'GameClue: Error reported from creating clue',
  }

  export interface DatabasePushUpdate extends Action {
    type: ActionTypes.DatabasePushUpdate;
    gameClues: GameClue.Entity[];
  }

  export interface CreateClueRequest extends Action {
    type: ActionTypes.CreateClueRequest;
    gameClue: Omit<Entity, 'id'>;
  }

  export interface CreateClueComplete extends Action {
    type: ActionTypes.CreateClueComplete;
    gameClue: Entity;
  }

  export interface CreateClueError extends Action {
    type: ActionTypes.CreateClueError;
    error: Error;
  }

  export type Actions =
    | CreateClueRequest
    | CreateClueComplete
    | CreateClueError
    | DatabasePushUpdate;
}
