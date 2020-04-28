import React, { memo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box } from "@material-ui/core";
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import isEqual from 'lodash/isEqual';

import { useDoc } from "../hooks/useDoc";
import { db } from "../services/firebase";
import { databasePushUpdate } from "../state/game/game.actions";
import { Root } from "../state/root.types";
import { Game as IGame } from "../state/game/game.types";
import GameBoard from "../components/GameBoard";
import Lobby from "../components/Lobby";
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

  const game = useSelector((state: Root.State) => state.game.data, isEqual);

  useDoc<IGame.Entity>(
    () => db.collection('games').doc(gameId),
    {
      data: game => game && dispatch(databasePushUpdate(game))
    }, [gameId]
  )

  return (
    <Box className={classes.root}>
      <GameInfo />
      {game.status === IGame.Status.Open && <Lobby />}
      {(game.status === IGame.Status.InSession || game.status === IGame.Status.Over) && <GameBoard />}
    </Box>
  );
}

export default memo(Game);
