import { takeEvery, fork, all } from 'redux-saga/effects';

import { analytics } from '../../services/firebase';
import { GameCard } from '../gameCard/gameCard.types';
import { Player } from '../player/player.types';
import { Game } from '../game/game.types';

function playerSignedIn(action: Player.SignInPlayerComplete) {
  analytics.logEvent('login', { method: 'anonymous' });
  analytics.setUserId(action.player.id);
}

function createdGame() {
  analytics.logEvent('Created Game');
}

function startedGame() {
  analytics.logEvent('Started Game');
}

function leftGame() {
  analytics.logEvent('Left Game');
}

function joinedGame() {
  analytics.logEvent('Joined Game');
}

function flippedCard() {
  analytics.logEvent('Flipped Card');
}

function switchedTeams() {
  analytics.logEvent('Switched Teams');
}

function promotedPlayerToSpymaster() {
  analytics.logEvent('Promoted Player to Spymaster');
}

function endedTurn() {
  analytics.logEvent('Ended Turn');
}

function gameStateUpdated(action: Game.GameStateUpdated) {
  if (action.game.status === Game.Status.Over) {
    analytics.logEvent('Game Over', {
      whoWon: action.game.who_won,
    });
  }
}

function* playerSignedInListener() {
  yield takeEvery(Player.ActionTypes.SignInPlayerComplete, playerSignedIn);
}

function* createdGameListener() {
  yield takeEvery(Game.ActionTypes.CreateGameComplete, createdGame);
}

function* startedGameListener() {
  yield takeEvery(Game.ActionTypes.StartGameComplete, startedGame);
}

function* leftGameListener() {
  yield takeEvery(Game.ActionTypes.LeaveGameComplete, leftGame);
}

function* joinedGameListener() {
  yield takeEvery(Game.ActionTypes.JoinGameComplete, joinedGame);
}

function* flippedCardListener() {
  yield takeEvery(GameCard.ActionTypes.FlipGameCardComplete, flippedCard);
}

function* gameStateUpdatedListener() {
  yield takeEvery(Game.ActionTypes.GameStateUpdated, gameStateUpdated);
}

function* switchedTeamsListener() {
  yield takeEvery(Game.ActionTypes.SwitchTeamsComplete, switchedTeams);
}

function* promotedPlayerToSpymasterListener() {
  yield takeEvery(Game.ActionTypes.PromoteToSpymasterComplete, promotedPlayerToSpymaster);
}

function* endedTurnListener() {
  yield takeEvery(Game.ActionTypes.EndTurnComplete, endedTurn);
}

export function* analyticsSaga() {
  yield all([
    fork(playerSignedInListener),
    fork(createdGameListener),
    fork(startedGameListener),
    fork(leftGameListener),
    fork(joinedGameListener),
    fork(flippedCardListener),
    fork(gameStateUpdatedListener),
    fork(switchedTeamsListener),
    fork(promotedPlayerToSpymasterListener),
    fork(endedTurnListener),
  ]);
}
