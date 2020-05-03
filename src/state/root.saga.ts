import { all, fork } from 'redux-saga/effects';

import { playerSaga } from './player/player.saga';
import { gameSaga } from './game/game.saga';
import { gameCardSaga } from './gameCard/gameCard.saga';
import { analyticsSaga } from './analytics/analytics.saga';
import { gameClueSaga } from './gameClue/gameClue.saga';

export default function* rootSaga() {
  yield all([
    fork(analyticsSaga),
    fork(gameCardSaga),
    fork(gameClueSaga),
    fork(gameSaga),
    fork(playerSaga),
  ]);
}
