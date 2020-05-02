import { all, call, fork, takeEvery, put, select, takeLatest } from 'redux-saga/effects';
import produce from 'immer';

import { db } from '../../services/firebase';
import { Game } from './game.types';
import { Player } from '../player/player.types';
import { Root } from '../root.types';
import { GameCard } from '../gameCard/gameCard.types';
import {
  joinGameError,
  joinGameComplete,
  leaveGameComplete,
  createGameComplete,
  startGameComplete,
  createGameError,
  switchTeamsComplete,
  switchTeamsError,
  promoteToSpymasterComplete,
  promoteToSpymasterError,
  endTurnError,
  endTurnComplete,
  leaveGameError,
  startGameError,
  loadGameError,
  loadGameComplete,
  loadGameRequest,
  gameStateUpdated,
} from './game.actions';
import {
  databasePushGameCardUpdate,
  databasePushGameCardStateUpdate,
} from '../gameCard/gameCard.actions';
import { blankPlayer } from '../player/player.reducer';
import { blankGame } from './game.reducer';
import {
  getGameCardStateData,
  getGameCards,
  getGameCardStates,
} from '../gameCard/gameCard.saga';
import { GameClue } from '../gameClue/gameClue.types';

const getUniqueGameId = async () => {
  let gameId;
  let tries = 1;
  const gameCollection = db.collection('games');

  do {
    const tryGameId = Math.random().toString(36).substr(2, 4);
    const gameRef = gameCollection.doc(tryGameId);
    const gameSnapshot = await gameRef.get();
    if (!gameSnapshot.exists) {
      gameId = tryGameId;
    }
  } while (!gameId || tries > 10);

  if (!gameId) {
    throw new Error(`Holy moly! We can't get a new gameId after 10 tries?
    Maybe bump up the length to 5 characters?`);
  }

  return gameId;
};

const getTeamForPlayer = (game: Game.Entity, player: Player.Entity) => {
  if (game.blueSpymaster.id === player.id) {
    return {
      type: Game.PlayerType.Spymaster,
      color: Game.TeamColor.Blue,
    };
  }

  if (game.redSpymaster.id === player.id) {
    return {
      type: Game.PlayerType.Spymaster,
      color: Game.TeamColor.Red,
    };
  }

  if (game.blueAgents.map((a) => a.id).includes(player.id)) {
    return {
      type: Game.PlayerType.Agent,
      color: Game.TeamColor.Blue,
    };
  }

  return {
    type: Game.PlayerType.Agent,
    color: Game.TeamColor.Red,
  };
};

export const getGameData = async (gameId: string) => {
  const gameRef = db.collection('games').doc(gameId.toLowerCase());
  const gameSnapshot = await gameRef.get();
  return gameSnapshot.data() as Game.Entity;
};

const setGameData = async (game: Game.Entity) => {
  const gameRef = db.collection('games').doc(game.id);
  return await gameRef.set(game);
};

function* loadGameCards(game: Game.Entity, player: Player.Entity) {
  const { type } = getTeamForPlayer(game, player);
  const [ gameCardsData, gameCardStatesData ]: [
    GameCard.GameCardEntity[],
    GameCard.GameCardStateEntity[]
  ] = yield all([
    call(getGameCards, game.id),
    call(getGameCardStates, game.id, type === Game.PlayerType.Spymaster),
  ]);
  yield all([
    put(databasePushGameCardUpdate(gameCardsData)),
    put(databasePushGameCardStateUpdate(gameCardStatesData)),
  ]);
}

function* switchTeams() {
  try {
    const player: Player.Entity = yield select((state: Root.State) => state.player.data);
    const gameId = yield select((state: Root.State) => state.game.data.id);
    const gameData: Game.Entity = yield call(getGameData, gameId);
    const team = getTeamForPlayer(gameData, player);

    if (team.type === Game.PlayerType.Spymaster) {
      return; //Spymasters can't move!
    }

    const newGameData = produce(gameData, (draft) => {
      if (team.color === Game.TeamColor.Blue) {
        draft.blueAgents = draft.blueAgents.filter((a) => a.id !== player.id);
        draft.redAgents.push(player);
      } else {
        draft.redAgents = draft.redAgents.filter((a) => a.id !== player.id);
        draft.blueAgents.push(player);
      }
    });

    yield call(setGameData, newGameData);
    yield put(switchTeamsComplete());
  } catch (e) {
    yield put(switchTeamsError(e));
  }
}

function* promotePlayerToSpymaster(action: Game.PromoteToSpymasterRequest) {
  try {
    const player = action.player;
    const gameId = yield select((state: Root.State) => state.game.data.id);
    const gameData: Game.Entity = yield call(getGameData, gameId);
    const team = getTeamForPlayer(gameData, player);

    if (team.type === Game.PlayerType.Spymaster) {
      return; // Already a Spymaster
    }

    const newGameData = produce(gameData, (draft) => {
      if (team.color === Game.TeamColor.Blue) {
        const oldSpymaster = draft.blueSpymaster;
        draft.blueAgents.push(oldSpymaster);
        draft.blueAgents = draft.blueAgents.filter((a) => a.id !== player.id);
        draft.blueSpymaster = player;
      } else {
        const oldSpymaster = draft.redSpymaster;
        draft.redAgents.push(oldSpymaster);
        draft.redAgents = draft.redAgents.filter((a) => a.id !== player.id);
        draft.redSpymaster = player;
      }
    });

    yield call(setGameData, newGameData);
    yield put(promoteToSpymasterComplete());
  } catch (e) {
    yield put(promoteToSpymasterError(e));
  }
}

function* endTurn() {
  try {
    const game: Game.Entity = yield select((state: Root.State) => state.game.data);

    if (!game) {
      return;
    }

    const newGameData = produce(game, (draft) => {
      const currentTurn = draft.turn;
      draft.turn =
        draft.turn === Game.TeamColor.Blue ? Game.TeamColor.Red : Game.TeamColor.Blue;
      draft.clue = '';
      if (currentTurn === Game.TeamColor.Blue) {
        draft.blueHasExtraGuess = draft.numberOfGuesses > 0;
      }
      if (currentTurn === Game.TeamColor.Red) {
        draft.redHasExtraGuess = draft.numberOfGuesses > 0;
      }

      draft.numberOfGuesses = -1;
    });

    yield call(setGameData, newGameData);
    yield put(endTurnComplete());
  } catch (e) {
    yield put(endTurnError(e));
  }
}

function* joinGame(action: Player.JoinGameComplete) {
  try {
    const player = action.player;
    if (!player.currentGameId) {
      return;
    }

    const gameData: Game.Entity = yield call(getGameData, player.currentGameId);

    if (!gameData) {
      return yield put(joinGameError(new Error('The game does not exist!')));
    }

    const newGameData = produce(gameData, (draft) => {
      if (draft.blueSpymaster.id === '') {
        draft.blueSpymaster = player;
      } else if (draft.redSpymaster.id === '') {
        draft.redSpymaster = player;
      } else {
        if (draft.redAgents.length < draft.blueAgents.length) {
          draft.redAgents.push(player);
        } else {
          draft.blueAgents.push(player);
        }
      }
    });

    yield call(setGameData, newGameData);

    if (newGameData.status === Game.Status.InSession) {
      yield call(loadGameCards, newGameData, player);
    }

    yield put(joinGameComplete(newGameData));
  } catch (e) {
    yield put(joinGameError(e));
  }
}

function* seedExistingGame(action: Player.SignInPlayerComplete) {
  try {
    if (!action.player.currentGameId) {
      return;
    }

    yield put(loadGameRequest(action.player.currentGameId));

    const gameData: Game.Entity = yield call(getGameData, action.player.currentGameId);
    if (gameData.status === Game.Status.InSession) {
      yield call(loadGameCards, gameData, action.player);
    }

    yield put(loadGameComplete(gameData));
  } catch (e) {
    yield put(loadGameError(e));
  }
}

function* leaveGame() {
  try {
    const player: Player.Entity = yield select((state: Root.State) => state.player.data);

    if (!player.currentGameId) {
      return;
    }

    const gameData: Game.Entity = yield call(getGameData, player.currentGameId);

    if (!gameData) {
      // Game no longer exists so just say we left it
      return yield put(leaveGameComplete(gameData));
    }

    const newGameData = produce(gameData, (draft) => {
      const team = getTeamForPlayer(gameData, player);
      if (team.type === Game.PlayerType.Spymaster) {
        if (team.color === Game.TeamColor.Blue) {
          const newSpymaster = draft.blueAgents.shift();
          draft.blueSpymaster = newSpymaster ? newSpymaster : blankPlayer;
        } else {
          const newSpymaster = draft.redAgents.shift();
          draft.redSpymaster = newSpymaster ? newSpymaster : blankPlayer;
        }
      } else {
        if (team.color === Game.TeamColor.Blue) {
          draft.blueAgents = draft.blueAgents.filter((a) => a.id !== player.id);
        } else {
          draft.redAgents = draft.redAgents.filter((a) => a.id !== player.id);
        }
      }
    });

    yield call(setGameData, newGameData);
    yield put(leaveGameComplete(blankGame));
  } catch (e) {
    yield put(leaveGameError(e));
  }
}

function* startGame(action: Game.StartGameRequest) {
  try {
    const gameData: Game.Entity = yield call(getGameData, action.gameId);

    if (!gameData) {
      return;
    }

    const whoIsFirst = Math.round(Math.random())
      ? Game.TeamColor.Blue
      : Game.TeamColor.Red;

    const newGameData = produce(gameData, (draft) => {
      draft.status = Game.Status.InSession;
      draft.turn = draft.doubleAgent = whoIsFirst;
    });

    yield call(setGameData, newGameData);
    yield put(startGameComplete(newGameData, whoIsFirst));
  } catch (e) {
    yield put(startGameError(e));
  }
}

function* createGame() {
  try {
    const player: Player.Entity = yield select((state: Root.State) => state.player.data);
    const gameId: string = yield call(getUniqueGameId);

    const gameData: Game.Entity = {
      id: gameId,
      blueSpymaster: player,
      redSpymaster: blankPlayer,
      redAgents: [],
      blueAgents: [],
      status: Game.Status.Open,
      turn: Game.TeamColor.Blue, // This will get randomly set in createGameCards()
      doubleAgent: Game.TeamColor.Blue, // This will get randomly set in createGameCards()
      redHasExtraGuess: false,
      blueHasExtraGuess: false,
      numberOfGuesses: -1,
    };

    yield call(setGameData, gameData);
    yield put(createGameComplete(gameData));
  } catch (e) {
    yield put(createGameError(e));
  }
}

function* updateStateOfGame(action: GameCard.FlipGameCardComplete) {
  const gameId: string = yield select((state: Root.State) => state.game.data.id);
  const gameData: Game.Entity = yield call(getGameData, gameId);
  const gameCardStateData: GameCard.GameCardStateEntity = yield call(
    getGameCardStateData,
    action.gameCardId
  );
  const gameCards: GameCard.GameCardEntity[] = yield call(getGameCards, gameId);
  const gameCardStateCollection: GameCard.GameCardStateEntity[] = yield call(
    getGameCardStates,
    gameId
  );

  const flippedGameCardStateMap = gameCards.reduce(
    (acc, card) => {
      const state = gameCardStateCollection.find((cardState) => cardState.id === card.id);
      return {
        ...acc,
        [card.id]: state || {
          id: card.id,
          flipped: false,
          gameId: card.gameId,
          type: GameCard.CardType.Unkown,
        },
      };
    },
    {} as {
      [id: string]: GameCard.GameCardStateEntity;
    }
  );

  const blueCardsFlipped = gameCards.filter(
    (card) =>
      flippedGameCardStateMap[card.id].type === GameCard.CardType.BlueTeam &&
      flippedGameCardStateMap[card.id].flipped
  );
  const redCardsFlipped = gameCards.filter(
    (card) =>
      flippedGameCardStateMap[card.id].type === GameCard.CardType.RedTeam &&
      flippedGameCardStateMap[card.id].flipped
  );
  const blueCardWinCount = gameData.doubleAgent === Game.TeamColor.Blue ? 9 : 8;
  const redCardWinCount = gameData.doubleAgent === Game.TeamColor.Red ? 9 : 8;

  const newGameData = produce(gameData, (draft) => {
    // Rule: Flipped Assassin card, game over.
    if (gameCardStateData.type === GameCard.CardType.Assassin) {
      draft.status = Game.Status.Over;
      draft.whoWon =
        gameData.turn === Game.TeamColor.Blue ? Game.TeamColor.Red : Game.TeamColor.Blue;
      // Rule: Flipped Bystander card, round automatically over and it's now the other teams turn
    } else if (gameCardStateData.type === GameCard.CardType.Bystander) {
      draft.turn =
        gameData.turn === Game.TeamColor.Blue ? Game.TeamColor.Red : Game.TeamColor.Blue;
      draft.clue = '';
      draft.numberOfGuesses = -1;
      // Blue Teams Flip
    } else if (gameData.turn === Game.TeamColor.Blue) {
      // Rule: Blue team flipped all their cards, they win
      if (blueCardWinCount === blueCardsFlipped.length) {
        draft.status = Game.Status.Over;
        draft.whoWon = Game.TeamColor.Blue;
      } else {
        // Rule: Blue team flipped a red card, round automatically over and it's now other teams turn
        if (gameCardStateData.type === GameCard.CardType.RedTeam) {
          draft.turn = Game.TeamColor.Red;
          draft.clue = '';
          draft.numberOfGuesses = -1;
        } else {
          // Decrement number of guesses allowed. 9 and 10 have special meaning
          if (draft.numberOfGuesses < 9) {
            draft.numberOfGuesses--;
          }

          // Rule: If 0, check to see if they have an extra guess or if round over
          if (draft.numberOfGuesses === 0) {
            // If they have extra guess, increment numberOfGuesses
            if (draft.blueHasExtraGuess) {
              draft.numberOfGuesses++;
              draft.blueHasExtraGuess = false;
            } else {
              // Rule: No more guesses left, it's now Reds turn
              draft.turn = Game.TeamColor.Red;
              draft.clue = '';
              draft.numberOfGuesses = -1;
            }
          }
        }
      }
    } else if (gameData.turn === Game.TeamColor.Red) {
      // Rule: Red team flipped all their cards, they win
      if (redCardWinCount === redCardsFlipped.length) {
        draft.status = Game.Status.Over;
        draft.whoWon = Game.TeamColor.Red;
      } else {
        // Rule: Red team flipped a blue card, round automatically over and it's now other teams turn
        if (gameCardStateData.type === GameCard.CardType.BlueTeam) {
          draft.turn = Game.TeamColor.Blue;
          draft.clue = '';
          draft.numberOfGuesses = -1;
        } else {
          // Decrement number of guesses allowed. 9 and 10 have special meaning
          if (draft.numberOfGuesses < 9) {
            draft.numberOfGuesses--;
          }
          // Rule: If 0, check to see if they have an extra guess or if round over
          if (draft.numberOfGuesses === 0) {
            // If they have extra guess, increment numberOfGuesses
            if (draft.redHasExtraGuess) {
              draft.numberOfGuesses++;
              draft.redHasExtraGuess = false;
            } else {
              // Rule: No more guesses left, it's now Blues turn
              draft.turn = Game.TeamColor.Blue;
              draft.clue = '';
              draft.numberOfGuesses = -1;
            }
          }
        }
      }
    }
  });

  yield call(setGameData, newGameData);
  yield put(gameStateUpdated(newGameData));
}

function* setLatestClue(action: GameClue.CreateClueComplete) {
  const gameId = action.gameClue.gameId;
  const gameData: Game.Entity = yield call(getGameData, gameId);

  const newGameData = produce(gameData, (draft) => {
    draft.numberOfGuesses = action.gameClue.numberOfGuesses;
    draft.clue = action.gameClue.clue;
  });

  yield call(setGameData, newGameData);
}

function* switchTeamsListener() {
  yield takeEvery(Game.ActionTypes.SwitchTeamsRequest, switchTeams);
}

function* promotePlayerToSpymasterListener() {
  yield takeEvery(Game.ActionTypes.PromoteToSpymasterRequest, promotePlayerToSpymaster);
}

function* endTurnListener() {
  yield takeEvery(Game.ActionTypes.EndTurnRequest, endTurn);
}

function* joinGameListener() {
  yield takeEvery(Player.ActionTypes.JoinGameComplete, joinGame);
}

function* leaveGameListener() {
  yield takeEvery(Game.ActionTypes.LeaveGameRequest, leaveGame);
}

function* startGameListener() {
  yield takeEvery(Game.ActionTypes.StartGameRequest, startGame);
}

function* createGameListner() {
  yield takeEvery(Game.ActionTypes.CreateGameRequest, createGame);
}

function* seedExistingGameListener() {
  yield takeEvery(Player.ActionTypes.SignInPlayerComplete, seedExistingGame);
}

function* updateStateOfGameListener() {
  yield takeEvery(GameCard.ActionTypes.FlipGameCardComplete, updateStateOfGame);
}

function* setLatestClueListener() {
  yield takeLatest(GameClue.ActionTypes.CreateClueComplete, setLatestClue);
}

export function* gameSaga() {
  yield all([
    fork(switchTeamsListener),
    fork(promotePlayerToSpymasterListener),
    fork(endTurnListener),
    fork(joinGameListener),
    fork(leaveGameListener),
    fork(startGameListener),
    fork(createGameListner),
    fork(seedExistingGameListener),
    fork(updateStateOfGameListener),
    fork(setLatestClueListener),
  ]);
}
