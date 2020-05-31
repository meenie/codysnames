import React, { memo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box } from '@material-ui/core';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import isEqual from 'lodash/isEqual';
import gql from 'graphql-tag';
import { useSubscription } from '@apollo/react-hooks';

import { databasePushUpdate } from '../state/game/game.actions';
import { Root } from '../state/root.types';
import { Game as IGame } from '../state/game/game.types';
import GameBoard from '../components/GameBoard';
import Lobby from '../components/Lobby';
import GameInfo from '../components/GameInfo';
import { GAME_FIELDS_FRAGMENT } from '../state/game/game.graphql';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      marginTop: theme.spacing(5),
    },
    gameInfoBox: {
      position: 'absolute',
      left: theme.spacing(3),
      top: theme.spacing(3),
    },
    gameInfo: {
      color: 'white',
      '& span': {
        textTransform: 'uppercase',
        fontWeight: 'bolder',
        fontFamily: 'monospace',
        fontSize: '1.8rem',
      },
    },
    leaveGame: {},
  })
);

const GAME_SUB = gql`
  subscription GameSubscription($gameId: String!) {
    games_by_pk(id: $gameId) {
      ...game_fields
    }
  }
  ${GAME_FIELDS_FRAGMENT}
`;

const Game: React.FC<{ gameId: string }> = ({ gameId }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { data, loading } = useSubscription(GAME_SUB, { variables: { gameId } });
  const game = useSelector((state: Root.State) => state.game.data, isEqual);

  useEffect(
    () => {
      if (data && !loading) {
        const game = data.games_by_pk;
        delete game.__typename;
        dispatch(databasePushUpdate(game));
      }
    },
    [ data, loading, dispatch ]
  );

  return (
    <Box className={classes.root}>
      <GameInfo />
      {game.status === IGame.Status.Open && <Lobby />}
      {(game.status === IGame.Status.InSession || game.status === IGame.Status.Over) && (
        <GameBoard />
      )}
    </Box>
  );
};

export default memo(Game);
