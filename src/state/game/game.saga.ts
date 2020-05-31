import { all, call, fork, takeEvery, put, select, takeLatest } from 'redux-saga/effects';
import produce from 'immer';

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
  flipCardComplete,
} from './game.actions';
import { blankGame } from './game.reducer';
import { GameClue } from '../gameClue/gameClue.types';
import { Apollo } from '../apollo/apollo.types';
import {
  getGameData,
  setGamesPlayersData,
  setGameData,
  getGamesPlayersData,
  deleteGamesPlayersData,
  createGameData,
} from './game.graphql';

const getTeamForPlayer = (game: Game.Entity, player: Player.Entity) => {
  if (game.blue_spymaster.id === player.id) {
    return {
      type: Game.PlayerType.Spymaster,
      color: Game.TeamColor.Blue,
    };
  }

  if (game.red_spymaster.id === player.id) {
    return {
      type: Game.PlayerType.Spymaster,
      color: Game.TeamColor.Red,
    };
  }

  if (game.blue_agents.map((a) => a.id).includes(player.id)) {
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

function* switchTeams() {
  try {
    const player: Player.Entity = yield select((state: Root.State) => state.player.data);
    const gameId = yield select((state: Root.State) => state.game.data.id);
    const client: Apollo.Entity = yield select(
      (state: Root.State) => state.apollo.client
    );
    const gameData: Game.Entity = yield call(getGameData, client, gameId);
    const team = getTeamForPlayer(gameData, player);

    if (team.type === Game.PlayerType.Spymaster) {
      return; //Spymasters can't move!
    }

    let newColor =
      team.color === Game.TeamColor.Blue ? Game.TeamColor.Red : Game.TeamColor.Blue;

    yield call(setGamesPlayersData, client, player.id, gameId, newColor, false);
    yield put(switchTeamsComplete());
  } catch (e) {
    yield put(switchTeamsError(e));
  }
}

function* promotePlayerToSpymaster(action: Game.PromoteToSpymasterRequest) {
  try {
    const player = action.player;
    const gameId = yield select((state: Root.State) => state.game.data.id);
    const client: Apollo.Entity = yield select(
      (state: Root.State) => state.apollo.client
    );
    const gameData: Game.Entity = yield call(getGameData, client, gameId);
    const team = getTeamForPlayer(gameData, player);

    if (team.type === Game.PlayerType.Spymaster) {
      return; // Already a Spymaster
    }

    if (team.color === Game.TeamColor.Blue) {
      yield call(
        setGamesPlayersData,
        client,
        gameData.blue_spymaster.id,
        gameId,
        Game.TeamColor.Blue,
        false
      );
      yield call(
        setGamesPlayersData,
        client,
        player.id,
        gameId,
        Game.TeamColor.Blue,
        true
      );
    } else {
      yield call(
        setGamesPlayersData,
        client,
        gameData.red_spymaster.id,
        gameId,
        Game.TeamColor.Red,
        false
      );
      yield call(
        setGamesPlayersData,
        client,
        player.id,
        gameId,
        Game.TeamColor.Red,
        true
      );
    }

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

    const client: Apollo.Entity = yield select(
      (state: Root.State) => state.apollo.client
    );

    const newGameData = produce(game, (draft) => {
      const currentTurn = draft.turn;
      draft.turn =
        draft.turn === Game.TeamColor.Blue ? Game.TeamColor.Red : Game.TeamColor.Blue;
      draft.clue = '';
      if (currentTurn === Game.TeamColor.Blue) {
        draft.blue_has_extra_guess = draft.number_of_guesses > 0;
      }
      if (currentTurn === Game.TeamColor.Red) {
        draft.red_has_extra_guess = draft.number_of_guesses > 0;
      }

      draft.number_of_guesses = -1;
    });

    yield call(setGameData, client, newGameData);
    yield put(endTurnComplete());
  } catch (e) {
    yield put(endTurnError(e));
  }
}

function* joinGame(action: Player.JoinGameComplete) {
  try {
    const player = action.player;
    if (!player.current_game_id) {
      return;
    }

    const client: Apollo.Entity = yield select(
      (state: Root.State) => state.apollo.client
    );

    const gameData: Game.Entity = yield call(getGameData, client, player.current_game_id);

    if (!gameData) {
      return yield put(joinGameError(new Error('The game does not exist!')));
    }

    const gamesPlayersData: Game.GamesPlayers[] = yield call(
      getGamesPlayersData,
      client,
      gameData.id
    );

    const blueSpymaster = gamesPlayersData.find(
      (gp) => gp.color === Game.TeamColor.Blue && gp.is_spymaster
    );
    const redSpymaster = gamesPlayersData.find(
      (gp) => gp.color === Game.TeamColor.Red && gp.is_spymaster
    );
    const blueAgentsCount = gamesPlayersData.filter(
      (gp) => gp.color === Game.TeamColor.Blue && !gp.is_spymaster
    ).length;
    const redAgentsCount = gamesPlayersData.filter(
      (gp) => gp.color === Game.TeamColor.Red && !gp.is_spymaster
    ).length;

    let color, isSpymaster;
    if (!blueSpymaster) {
      color = Game.TeamColor.Blue;
      isSpymaster = true;
    } else if (!redSpymaster) {
      color = Game.TeamColor.Red;
      isSpymaster = true;
    } else if (blueAgentsCount > redAgentsCount) {
      color = Game.TeamColor.Red;
      isSpymaster = false;
    } else {
      color = Game.TeamColor.Blue;
      isSpymaster = false;
    }

    yield call(setGamesPlayersData, client, player.id, gameData.id, color, isSpymaster);
    yield put(joinGameComplete(gameData));
  } catch (e) {
    yield put(joinGameError(e));
  }
}

function* seedExistingGame(action: Player.SignInPlayerComplete) {
  try {
    if (!action.player.current_game_id) {
      return;
    }

    const client: Apollo.Entity = yield select(
      (state: Root.State) => state.apollo.client
    );

    yield put(loadGameRequest(action.player.current_game_id));

    const gameData: Game.Entity = yield call(
      getGameData,
      client,
      action.player.current_game_id
    );

    yield put(loadGameComplete(gameData));
  } catch (e) {
    yield put(loadGameError(e));
  }
}

function* leaveGame() {
  try {
    const player: Player.Entity = yield select((state: Root.State) => state.player.data);

    if (!player.current_game_id) {
      return;
    }

    const client: Apollo.Entity = yield select(
      (state: Root.State) => state.apollo.client
    );

    const gameData: Game.Entity = yield call(getGameData, client, player.current_game_id);

    if (!gameData) {
      // Game no longer exists so just say we left it
      return yield put(leaveGameComplete(gameData));
    }

    const team = getTeamForPlayer(gameData, player);

    // Delete to leave game
    yield call(deleteGamesPlayersData, client, player.id, gameData.id);

    // Promote someone to spymaster if we need to.
    if (team.type === Game.PlayerType.Spymaster) {
      if (team.color === Game.TeamColor.Blue) {
        const newSpymaster = gameData.blue_agents.shift();
        if (newSpymaster) {
          yield call(
            setGamesPlayersData,
            client,
            newSpymaster.id,
            gameData.id,
            team.color,
            true
          );
        }
      } else {
        const newSpymaster = gameData.red_agents.shift();
        if (newSpymaster) {
          yield call(
            setGamesPlayersData,
            client,
            newSpymaster.id,
            gameData.id,
            team.color,
            true
          );
        }
      }
    }

    yield put(leaveGameComplete(blankGame));
  } catch (e) {
    yield put(leaveGameError(e));
  }
}

function* startGame(action: Game.StartGameRequest) {
  try {
    const client: Apollo.Entity = yield select(
      (state: Root.State) => state.apollo.client
    );

    const gameData: Game.Entity = yield call(getGameData, client, action.gameId);

    if (!gameData) {
      return;
    }

    const whoIsFirst = Math.round(Math.random())
      ? Game.TeamColor.Blue
      : Game.TeamColor.Red;

    const newGameData = produce(gameData, (draft) => {
      draft.status = Game.Status.InSession;
      draft.turn = draft.double_agent = whoIsFirst;
    });

    yield call(setGameData, client, newGameData);
    yield put(startGameComplete(newGameData, whoIsFirst));
  } catch (e) {
    yield put(startGameError(e));
  }
}

function* createGame() {
  try {
    const player: Player.Entity = yield select((state: Root.State) => state.player.data);
    const client: Apollo.Entity = yield select(
      (state: Root.State) => state.apollo.client
    );

    const newGameData: Game.Entity = yield call(createGameData, client, player.id);
    yield put(createGameComplete(newGameData));
  } catch (e) {
    yield put(createGameError(e));
  }
}

function* updateStateOfGame(action: GameCard.FlipGameCardComplete) {
  const gameId: string = yield select((state: Root.State) => state.game.data.id);
  const client: Apollo.Entity = yield select((state: Root.State) => state.apollo.client);
  const gameData: Game.Entity = yield call(getGameData, client, gameId);
  const flippedCard = gameData.cards.find((card) => card.id === action.cardId);
  if (!flippedCard) {
    throw new Error('Some shit went down and the card disappeared O.O');
  }

  const blueCardsFlipped = gameData.cards.filter(
    (card) =>
      card.state && card.state.type === GameCard.CardType.BlueTeam && card.state.flipped
  );
  const redCardsFlipped = gameData.cards.filter(
    (card) =>
      card.state && card.state.type === GameCard.CardType.RedTeam && card.state.flipped
  );
  const blueCardWinCount = gameData.double_agent === Game.TeamColor.Blue ? 9 : 8;
  const redCardWinCount = gameData.double_agent === Game.TeamColor.Red ? 9 : 8;
  const newGameData = produce(gameData, (draft) => {
    // Rule: Flipped Assassin card, game over.
    if (flippedCard.state.type === GameCard.CardType.Assassin) {
      draft.status = Game.Status.Over;
      draft.who_won =
        gameData.turn === Game.TeamColor.Blue ? Game.TeamColor.Red : Game.TeamColor.Blue;
      // Rule: Flipped Bystander card, round automatically over and it's now the other teams turn
    } else if (flippedCard.state.type === GameCard.CardType.Bystander) {
      draft.turn =
        gameData.turn === Game.TeamColor.Blue ? Game.TeamColor.Red : Game.TeamColor.Blue;
      draft.clue = '';
      draft.number_of_guesses = -1;
      // Blue Teams Flip
    } else if (gameData.turn === Game.TeamColor.Blue) {
      // Rule: Blue team flipped all their cards, they win
      if (blueCardWinCount === blueCardsFlipped.length) {
        draft.status = Game.Status.Over;
        draft.who_won = Game.TeamColor.Blue;
      } else {
        // Rule: Blue team flipped a red card, round automatically over and it's now other teams turn
        if (flippedCard.state.type === GameCard.CardType.RedTeam) {
          draft.turn = Game.TeamColor.Red;
          draft.clue = '';
          draft.number_of_guesses = -1;
        } else {
          // Decrement number of guesses allowed. 9 and 10 have special meaning
          if (draft.number_of_guesses < 9) {
            draft.number_of_guesses--;
          }
          // Rule: If 0, check to see if they have an extra guess or if round over
          if (draft.number_of_guesses === 0) {
            // If they have extra guess, increment numberOfGuesses
            if (draft.blue_has_extra_guess) {
              draft.number_of_guesses++;
              draft.blue_has_extra_guess = false;
            } else {
              // Rule: No more guesses left, it's now Reds turn
              draft.turn = Game.TeamColor.Red;
              draft.clue = '';
              draft.number_of_guesses = -1;
            }
          }
        }
      }
    } else if (gameData.turn === Game.TeamColor.Red) {
      // Rule: Red team flipped all their cards, they win
      if (redCardWinCount === redCardsFlipped.length) {
        draft.status = Game.Status.Over;
        draft.who_won = Game.TeamColor.Red;
      } else {
        // Rule: Red team flipped a blue card, round automatically over and it's now other teams turn
        if (flippedCard.state.type === GameCard.CardType.BlueTeam) {
          draft.turn = Game.TeamColor.Blue;
          draft.clue = '';
          draft.number_of_guesses = -1;
        } else {
          // Decrement number of guesses allowed. 9 and 10 have special meaning
          if (draft.number_of_guesses < 9) {
            draft.number_of_guesses--;
          }
          // Rule: If 0, check to see if they have an extra guess or if round over
          if (draft.number_of_guesses === 0) {
            // If they have extra guess, increment numberOfGuesses
            if (draft.red_has_extra_guess) {
              draft.number_of_guesses++;
              draft.red_has_extra_guess = false;
            } else {
              // Rule: No more guesses left, it's now Blues turn
              draft.turn = Game.TeamColor.Blue;
              draft.clue = '';
              draft.number_of_guesses = -1;
            }
          }
        }
      }
    }
  });
  yield call(setGameData, client, newGameData);
  yield put(gameStateUpdated(newGameData));
  yield put(flipCardComplete());
}

function* setLatestClue(action: GameClue.CreateClueComplete) {
  const gameId = action.gameClue.game_id;
  const client: Apollo.Entity = yield select((state: Root.State) => state.apollo.client);
  const gameData: Game.Entity = yield call(getGameData, client, gameId);
  const newGameData = produce(gameData, (draft) => {
    draft.number_of_guesses = action.gameClue.number_of_guesses;
    draft.clue = action.gameClue.clue;
  });
  yield call(setGameData, client, newGameData);
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
