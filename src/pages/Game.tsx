import React, { memo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box } from "@material-ui/core";
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import isEqual from 'lodash/isEqual';

import { Store } from "../store/types";
import { useDoc } from "../hooks/useDoc";
import { db } from "../services/firebase";
import { setGameData, setGameCardsData } from "../store/actions";
import GameBoard from "../components/GameBoard";
import { leaveGame } from "../store/effects";
import Lobby from "../components/Lobby";
import { useCollection } from "../hooks/useCollection";
import { getCurrentPlayerType } from "../store/selectors";
import GameInfo from "../components/GameInfo";


const useStyles = makeStyles((theme: Theme) => createStyles({
  root: {
    marginTop: theme.spacing(5),
  },
  gameInfoBox: {
    position: 'absolute',
    left: theme.spacing(3),
    top: theme.spacing(3)
  },
  gameInfo: {
    color: 'white',
    '& span': {
      textTransform: 'uppercase',
      fontWeight: 'bolder',
      fontFamily: 'monospace',
      fontSize: '1.8rem'
    }
  },
  leaveGame: {
  },
}));

const Game: React.FC<{ gameId: string; }> = ({ gameId }) => {
  const classes = useStyles();
  const dispatch = useDispatch();

  const game = useSelector((state: Store.ApplicationState) => state.game, isEqual);
  const currentPlayerType = useSelector(getCurrentPlayerType);
  const leavingGame = useSelector((state: Store.ApplicationState) => state.loading.leavingGame);
  const startingGame = useSelector((state: Store.ApplicationState) => state.loading.startingGame);

  useDoc<Store.Game>(
    () => db.collection('games').doc(gameId),
    {
      data: game => game ? dispatch(setGameData(game)) : dispatch(leaveGame()),
    }, [gameId]
  )

  useCollection<Store.GameCard>(
    () => db
      .collection('gameCards')
      .where('gameId', '==', game.id)
      .where('player', '==', currentPlayerType)
      .orderBy('order', 'asc'),
    {
      data: gameCards => !leavingGame && gameCards && dispatch(setGameCardsData(gameCards)),
    }, [game.id, currentPlayerType, leavingGame]
  )

  const gameLoaded = !!game.id;

  if (
    !gameLoaded ||
    leavingGame ||
    startingGame
  ) {
    return <p>&nbsp;</p>
  }

  return (
    <Box className={classes.root}>
      <GameInfo />
      {game.status === Store.Status.Open && <Lobby />}
      {(game.status === Store.Status.InSession || game.status === Store.Status.Over) && <GameBoard />}
    </Box>
  );
}

export default memo(Game);
