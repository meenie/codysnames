import { all, fork } from 'redux-saga/effects';

import { playerSaga } from './player/player.saga';
import { gameSaga } from './game/game.saga';
import { gameCardSaga } from './gameCard/gameCard.saga';

export default function* rootSaga() {
  yield all([ fork(playerSaga), fork(gameSaga), fork(gameCardSaga) ]);
}
