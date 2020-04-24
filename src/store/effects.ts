import { ThunkAction } from 'redux-thunk';
import shuffle from 'lodash/shuffle';
import produce from 'immer';

import { Store } from './types';
import {
  joinGameRequest,
  setPlayerData,
  joinGameError,
  createGameRequest,
  createGameSuccess,
  createGameError,
  joinGameSuccess,
  leaveGameSuccess,
  setPlayerNameError,
  setPlayerNameRequest,
  setPlayerNameSuccess,
  setGameData,
  createGameCardsRequest,
  createGameCardsSuccess,
  leaveGameRequest,
} from './actions';
import { auth, db, analytics } from '../services/firebase';
import { blankPlayer } from './reducer';
import { getCurrentPlayerColor } from './selectors';
import { getRandomNames } from '../helpers/names_list';

type Effect = ThunkAction<any, Store.ApplicationState, any, Store.ApplicationAction>;

const generateCardTypeMap = (whoIsStarting: Store.CardType) => {
  const cardTypeMap = [
    ...Array(8).fill(Store.CardType.BlueTeam),
    ...Array(8).fill(Store.CardType.RedTeam),
    ...Array(7).fill(Store.CardType.Bystander),
    Store.CardType.Assassin,
    whoIsStarting,
  ];

  return shuffle(cardTypeMap);
};

const getTeamForPlayer = (game: Store.Game, player: Store.Player) => {
  if (game.blueSpymaster.id === player.id) {
    return {
      type: Store.PlayerType.Spymaster,
      color: Store.TeamColor.Blue,
    };
  }

  if (game.redSpymaster.id === player.id) {
    return {
      type: Store.PlayerType.Spymaster,
      color: Store.TeamColor.Red,
    };
  }

  if (game.blueAgents.map((a) => a.id).includes(player.id)) {
    return {
      type: Store.PlayerType.Agent,
      color: Store.TeamColor.Blue,
    };
  }

  return {
    type: Store.PlayerType.Agent,
    color: Store.TeamColor.Red,
  };
};

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

export const setPlayerName = (name: string): Effect => async (dispatch, getState) => {
  dispatch(setPlayerNameRequest());

  const playerRef = db.collection('players').doc(getState().player.id);
  try {
    const playerSnapshot = await playerRef.get();
    const playerData = playerSnapshot.data() as Store.Player;

    const newPlayerData = produce(playerData, (draft) => {
      draft.name = name;
    });

    await playerRef.set(newPlayerData);

    dispatch(setPlayerNameSuccess(name));
  } catch (e) {
    dispatch(setPlayerNameError(e));
  }
};

export const switchTeams = (): Effect => async (dispatch, getState) => {
  const player = getState().player;

  if (!player.currentGameId) {
    return;
  }

  const gameRef = db.collection('games').doc(player.currentGameId);
  const gameSnapshot = await gameRef.get();
  const gameData = gameSnapshot.data() as Store.Game;

  if (!gameData) {
    return;
  }

  const team = getTeamForPlayer(gameData, player);

  if (team.type === Store.PlayerType.Spymaster) {
    return; //Spymasters can't move!
  }

  const newGameData = produce(gameData, (draft) => {
    if (team.color === Store.TeamColor.Blue) {
      draft.blueAgents = draft.blueAgents.filter((a) => a.id !== player.id);
      draft.redAgents.push(player);
    } else {
      draft.redAgents = draft.redAgents.filter((a) => a.id !== player.id);
      draft.blueAgents.push(player);
    }
  });

  return gameRef.set(newGameData);
};

export const promotePlayerToSpymaster = (player: Store.Player): Effect => async (
  dispatch,
  getState
) => {
  if (!player.currentGameId) {
    return; // Player not in a game
  }

  const gameRef = db.collection('games').doc(player.currentGameId);
  const gameSnapshot = await gameRef.get();
  const gameData = gameSnapshot.data() as Store.Game;

  if (!gameData) {
    return; // Game doesn't exist, O.o?
  }

  const team = getTeamForPlayer(gameData, player);

  if (team.type === Store.PlayerType.Spymaster) {
    return; // Already a Spymaster
  }

  const newGameData = produce(gameData, (draft) => {
    if (team.color === Store.TeamColor.Blue) {
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

  return gameRef.set(newGameData);
};

export const signInPlayer = (): Effect => async (dispatch, getState) => {
  const credential = await auth.signInAnonymously();
  const user = credential.user;

  if (user) {
    analytics.logEvent('login', { method: 'anonymous' });
    analytics.setUserId(user.uid);

    const playerRef = db.collection('players').doc(user.uid);
    const playerSnapshot = await playerRef.get();
    let playerData = playerSnapshot.data() as Store.Player;

    if (!playerData) {
      playerData = {
        id: user.uid,
        name: '',
        currentGameId: '',
      };

      await playerRef.set(playerData);
    }

    dispatch(setPlayerData(playerData));
  }
};

export const doneWithTurn = (): Effect => async (dispatch, getState) => {
  const state = getState();

  if (!state.game) {
    return;
  }

  const newGameData = produce(state.game, (draft) => {
    draft.turn =
      draft.turn === Store.TeamColor.Blue ? Store.TeamColor.Red : Store.TeamColor.Blue;
  });

  await db.collection('games').doc(state.game.id).set(newGameData);
};

export const flipCard = (card: Store.GameCard): Effect => async (dispatch, getState) => {
  const state = getState();
  if (!state.game) {
    return;
  }

  const currentTurn = state.game.turn;
  const currentPlayerColor = getCurrentPlayerColor(state);

  if (
    state.player.id === state.game.blueSpymaster.id || // Spymasters can't pick cards!
    state.player.id === state.game.redSpymaster.id || // Spymasters can't pick cards!
    currentTurn !== currentPlayerColor || // This isn't your team, man. You can't pick a card!
    state.game.status === Store.Status.Over // Game over, man! Game over!
  ) {
    return;
  }

  const gameSnapshot = await db.collection('games').doc(state.game.id).get();
  const gameData = gameSnapshot.data();

  if (!gameData) {
    return;
  }

  const agentGameCardRef = db.collection('gameCards').doc(card.id);
  const agentGameCardSnapshot = await agentGameCardRef.get();
  const agentGameCardData = agentGameCardSnapshot.data() as Store.GameCard;
  const spymasterGameCardId = card.id.replace(
    Store.PlayerType.Agent,
    Store.PlayerType.Spymaster
  );
  const spymasterGameCardRef = db.collection('gameCards').doc(spymasterGameCardId);
  const spymasterGameCardSnapshot = await spymasterGameCardRef.get();
  const spymasterGameCardData = spymasterGameCardSnapshot.data() as Store.GameCard;

  if (!spymasterGameCardData || !agentGameCardData) {
    return;
  }

  // Flip them both!
  agentGameCardData.flipped = spymasterGameCardData.flipped = true;
  // Reveal the type for the agent!
  agentGameCardData.type = spymasterGameCardData.type;

  const batch = db.batch();

  batch.set(agentGameCardRef, agentGameCardData);
  batch.set(spymasterGameCardRef, spymasterGameCardData);

  await batch.commit();

  const agentGameCardsRef = db
    .collection('gameCards')
    .where('gameId', '==', gameData.id)
    .where('player', '==', Store.PlayerType.Agent)
    .orderBy('order', 'asc');
  const agentGameCardsSnapshot = await agentGameCardsRef.get();
  const agentGameCards = agentGameCardsSnapshot.docs.map(
    (doc) => doc.data() as Store.GameCard
  );
  const blueCardsFlipped = agentGameCards.filter(
    (card) => card.type === Store.CardType.BlueTeam && card.flipped
  );
  const redCardsFlipped = agentGameCards.filter(
    (card) => card.type === Store.CardType.RedTeam && card.flipped
  );
  const blueCardWinCount = gameData.doubleAgent === Store.TeamColor.Blue ? 9 : 8;
  const redCardWinCount = gameData.doubleAgent === Store.TeamColor.Red ? 9 : 8;

  const newGameData = produce(gameData as Store.Game, (draft) => {
    if (agentGameCardData.type === Store.CardType.Assassin) {
      draft.status = Store.Status.Over;
      draft.whoWon =
        currentTurn === Store.TeamColor.Blue ? Store.TeamColor.Red : Store.TeamColor.Blue;
    } else if (agentGameCardData.type === Store.CardType.Bystander) {
      draft.turn =
        currentTurn === Store.TeamColor.Blue ? Store.TeamColor.Red : Store.TeamColor.Blue;
    } else if (currentTurn === Store.TeamColor.Blue) {
      if (agentGameCardData.type === Store.CardType.RedTeam) {
        draft.turn = Store.TeamColor.Red;
      }

      if (blueCardWinCount === blueCardsFlipped.length) {
        draft.status = Store.Status.Over;
        draft.whoWon = Store.TeamColor.Blue;
      }
    } else if (currentTurn === Store.TeamColor.Red) {
      if (agentGameCardData.type === Store.CardType.BlueTeam) {
        draft.turn = Store.TeamColor.Blue;
      }

      if (redCardWinCount === redCardsFlipped.length) {
        draft.status = Store.Status.Over;
        draft.whoWon = Store.TeamColor.Red;
      }
    }
  });

  await db.collection('games').doc(gameData.id).set(newGameData);

  // If the game is over, reveal all the cards for the agents.
  if (newGameData.status === Store.Status.Over) {
    const spymasterGameCardsRef = db
      .collection('gameCards')
      .where('gameId', '==', gameData.id)
      .where('player', '==', Store.PlayerType.Spymaster)
      .orderBy('order', 'asc');

    const spymasterGameCardsSnapshot = await spymasterGameCardsRef.get();
    const spymasterGameCards = spymasterGameCardsSnapshot.docs.map(
      (doc) => doc.data() as Store.GameCard
    );

    const batch = db.batch();
    agentGameCards.forEach((card, i) => {
      card.type = spymasterGameCards[i].type;
      batch.set(db.collection('gameCards').doc(card.id), card);
    });

    await batch.commit();
  }
};

export const joinGame = (gameId: string): Effect => async (dispatch, getState) => {
  dispatch(joinGameRequest());

  try {
    const player = getState().player;
    const gameRef = db.collection('games').doc(gameId.toLowerCase());
    const playerRef = db.collection('players').doc(player.id);
    const batch = db.batch();
    const gameSnapshot = await gameRef.get();
    const gameData = gameSnapshot.data() as Store.Game;

    if (player.currentGameId) {
      return dispatch(joinGameError(new Error('You are already in a game!')));
    }

    if (!gameData) {
      return dispatch(joinGameError(new Error('The game does not exist!')));
    }

    const newPlayerData = produce(player, (draft) => {
      draft.currentGameId = gameData.id;
    });

    const newGameData = produce(gameData, (draft) => {
      if (draft.blueSpymaster.id === '') {
        draft.blueSpymaster = newPlayerData;
      } else if (draft.redSpymaster.id === '') {
        draft.redSpymaster = newPlayerData;
      } else {
        if (draft.redAgents.length < draft.blueAgents.length) {
          draft.redAgents.push(newPlayerData);
        } else {
          draft.blueAgents.push(newPlayerData);
        }
      }
    });

    batch.set(gameRef, newGameData);
    batch.set(playerRef, newPlayerData);

    await batch.commit();

    return dispatch(joinGameSuccess(gameData.id));
  } catch (e) {
    return dispatch(joinGameError(e));
  }
};

export const leaveGame = (): Effect => async (dispatch, getState) => {
  dispatch(leaveGameRequest());
  const player = getState().player;

  if (!player.currentGameId) {
    return;
  }

  const playerRef = db.collection('players').doc(player.id);
  const gameRef = db.collection('games').doc(player.currentGameId);
  const gameSnapshot = await gameRef.get();
  const gameData = gameSnapshot.data() as Store.Game;
  const batch = db.batch();

  if (gameData) {
    const newGameData = produce(gameData, (draft) => {
      const team = getTeamForPlayer(gameData, player);
      if (team.type === Store.PlayerType.Spymaster) {
        if (team.color === Store.TeamColor.Blue) {
          const newSpymaster = draft.blueAgents.shift();
          draft.blueSpymaster = newSpymaster ? newSpymaster : blankPlayer;
        } else {
          const newSpymaster = draft.redAgents.shift();
          draft.redSpymaster = newSpymaster ? newSpymaster : blankPlayer;
        }
      } else {
        if (team.color === Store.TeamColor.Blue) {
          draft.blueAgents = draft.blueAgents.filter((a) => a.id !== player.id);
        } else {
          draft.redAgents = draft.redAgents.filter((a) => a.id !== player.id);
        }
      }
    });

    batch.set(gameRef, newGameData);
  }

  const newPlayerData = produce(player, (draft) => {
    draft.currentGameId = '';
  });

  batch.set(playerRef, newPlayerData);

  await batch.commit();

  return dispatch(leaveGameSuccess());
};

export const createGameCards = (
  gameId: string,
  whoIsFirst: Store.TeamColor
): Effect => async (dispatch, getState) => {
  dispatch(createGameCardsRequest());

  const batch = db.batch();
  const cardNames = await getRandomNames();
  const cardTypeMap = generateCardTypeMap(
    whoIsFirst === Store.TeamColor.Blue ? Store.CardType.BlueTeam : Store.CardType.RedTeam
  );

  const spymasterGameCardsData: Store.GameCard[] = [];
  cardNames.forEach((name, i) => {
    const newCardId = db.collection('gameCards').doc().id;
    const agentCardId = `${Store.PlayerType.Agent}-${newCardId}`;
    const spymasterCardId = `${Store.PlayerType.Spymaster}-${newCardId}`;
    const agentGameCardRef = db.collection('gameCards').doc(agentCardId);
    const spymasterGameCardRef = db.collection('gameCards').doc(spymasterCardId);

    const gameCardData = {
      id: agentGameCardRef.id,
      flipped: false,
      gameId,
      name,
      order: i,
      type: Store.CardType.Unkown,
      player: Store.PlayerType.Agent,
      siblingId: spymasterGameCardRef.id,
    };

    batch.set(agentGameCardRef, gameCardData);
    const spymasterGameCardData = {
      ...gameCardData,
      id: spymasterGameCardRef.id,
      type: cardTypeMap[i],
      player: Store.PlayerType.Spymaster,
      siblingId: agentGameCardRef.id,
    };
    batch.set(spymasterGameCardRef, spymasterGameCardData);
    spymasterGameCardsData.push(spymasterGameCardData);
  });

  await batch.commit();

  return dispatch(createGameCardsSuccess());
};

export const startGame = (gameId: string): Effect => async (dispatch, getState) => {
  const gameRef = db.collection('games').doc(gameId);
  const gameSnapshot = await gameRef.get();
  const gameData = gameSnapshot.data() as Store.Game;

  if (!gameData) {
    return;
  }
  const whoIsFirst = Math.round(Math.random())
    ? Store.TeamColor.Blue
    : Store.TeamColor.Red;

  await dispatch(createGameCards(gameId, whoIsFirst));

  const newGameData = produce(gameData, (draft) => {
    draft.status = Store.Status.InSession;
    draft.turn = draft.doubleAgent = whoIsFirst;
  });

  return await gameRef.set(newGameData);
};

export const createGame = (): Effect => async (dispatch, getState) => {
  dispatch(createGameRequest());

  const player = getState().player;
  const gameId = await getUniqueGameId();

  try {
    const batch = db.batch();
    const playerRef = db.collection('players').doc(player.id);
    const gameRef = db.collection('games').doc(gameId);

    const newPlayerData = produce(player, (draft) => {
      draft.currentGameId = gameId;
    });

    const gameData: Store.Game = {
      id: gameRef.id,
      blueSpymaster: newPlayerData,
      redSpymaster: blankPlayer,
      redAgents: [],
      blueAgents: [],
      status: Store.Status.Open,
      turn: Store.TeamColor.Blue, // This will get randomly set in createGameCards()
      doubleAgent: Store.TeamColor.Blue, // This will get randomly set in createGameCards()
    };

    batch.set(gameRef, gameData);
    batch.set(playerRef, newPlayerData);

    await batch.commit();
    dispatch(setGameData(gameData));

    return dispatch(createGameSuccess(gameData.id));
  } catch (e) {
    console.log(e);
    return dispatch(createGameError(e));
  }
};
