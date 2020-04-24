import React, { memo } from "react";

import { Paper } from '@material-ui/core';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import { useSelector, useDispatch } from "react-redux";
import classnames from 'classnames';

import { Store } from "../store/types";
import { flipCard } from "../store/effects";

const useStyles = makeStyles((theme: Theme) => createStyles({
  root: {
    height: 130,
    width: 169,
    textAlign: 'center',
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    fontWeight: 'bolder',
    fontFamily: `'Shadows Into Light', cursive`,
    cursor: 'pointer',
    textTransform: 'uppercase',
    backgroundColor: theme.gameColor.unknown,
    color: 'black',
    wordBreak: 'break-all',
  },
  red: {
    backgroundColor: theme.gameColor.red,
    cursor: 'default',
  },
  blue: {
    backgroundColor: theme.gameColor.blue,
    cursor: 'default',
  },
  assassin: {
    backgroundColor: theme.gameColor.assassin,
    cursor: 'default',
    color: 'white'
  },
  bystander: {
    backgroundColor: theme.gameColor.bystander,
    cursor: 'default',
  },
  flipped: {
    border: '8px solid white'
  },
  fontSize30: {
    fontSize: '30px'
  },
  fontSize35: {
    fontSize: '35px'
  },
  fontSize45: {
    fontSize: '45px'
  }
}))

const GameCard: React.FC<{ card: Store.GameCard; }> = ({ card }) => {
  const currentPlayerType = useSelector((state: Store.ApplicationState) => {
    const userId = state.player.id;
    if (state.game.blueSpymaster.id === userId || state.game.redSpymaster.id === userId) {
      return Store.PlayerType.Spymaster;
    }

    return Store.PlayerType.Agent;
  });
  const isSpymaster = currentPlayerType === Store.PlayerType.Spymaster;
  const gameOver = useSelector((state: Store.ApplicationState) => state.game?.status === Store.Status.Over);
  const dispatch = useDispatch();

  const classes = useStyles();
  const paperClasses = classnames(classes.root, {
    [classes.red]: (card.flipped || isSpymaster || gameOver) && card.type === Store.CardType.RedTeam,
    [classes.blue]: (card.flipped || isSpymaster || gameOver) && card.type === Store.CardType.BlueTeam,
    [classes.bystander]: (card.flipped || isSpymaster || gameOver) && card.type === Store.CardType.Bystander,
    [classes.assassin]: (card.flipped || isSpymaster || gameOver) && card.type === Store.CardType.Assassin,
    [classes.flipped]: card.flipped,
    [classes.fontSize30]: card.name.length >= 10,
    [classes.fontSize35]: card.name.length >= 8 && card.name.length < 10,
    [classes.fontSize45]: card.name.length < 8,
  })
  return (
    <Paper className={paperClasses} onClick={() => dispatch(flipCard(card))}>
      {(!card.flipped || gameOver) && card.name}
    </Paper>
  );
}

export default memo(GameCard);
