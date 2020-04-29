import React, { memo } from 'react';

import { Paper } from '@material-ui/core';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import { useSelector, useDispatch } from 'react-redux';
import classnames from 'classnames';

import { flipGameCardRequest } from '../state/gameCard/gameCard.actions';
import { Root } from '../state/root.types';
import { GameCard as IGameCard } from '../state/gameCard/gameCard.types';
import { Game } from '../state/game/game.types';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      height: 130,
      width: 169,
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
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
      color: 'white',
    },
    bystander: {
      backgroundColor: theme.gameColor.bystander,
      cursor: 'default',
    },
    flipped: {
      border: '8px solid white',
    },
    fontSize30: {
      fontSize: '30px',
    },
    fontSize35: {
      fontSize: '35px',
    },
    fontSize45: {
      fontSize: '45px',
    },
  })
);

const GameCard: React.FC<{ card: IGameCard.GameCardEntityWithStateEntity }> = ({
  card,
}) => {
  const currentPlayerType = useSelector((state: Root.State) => {
    const userId = state.player.data.id;
    if (
      state.game.data.blueSpymaster.id === userId ||
      state.game.data.redSpymaster.id === userId
    ) {
      return Game.PlayerType.Spymaster;
    }

    return Game.PlayerType.Agent;
  });
  const isSpymaster = currentPlayerType === Game.PlayerType.Spymaster;
  const gameOver = useSelector(
    (state: Root.State) => state.game.data.status === Game.Status.Over
  );
  const dispatch = useDispatch();

  const classes = useStyles();
  const paperClasses = classnames(classes.root, {
    [classes.red]:
      (card.state.flipped || isSpymaster || gameOver) &&
      card.state.type === IGameCard.CardType.RedTeam,
    [classes.blue]:
      (card.state.flipped || isSpymaster || gameOver) &&
      card.state.type === IGameCard.CardType.BlueTeam,
    [classes.bystander]:
      (card.state.flipped || isSpymaster || gameOver) &&
      card.state.type === IGameCard.CardType.Bystander,
    [classes.assassin]:
      (card.state.flipped || isSpymaster || gameOver) &&
      card.state.type === IGameCard.CardType.Assassin,
    [classes.flipped]: card.state.flipped,
    [classes.fontSize30]: card.name.length >= 10,
    [classes.fontSize35]: card.name.length >= 8 && card.name.length < 10,
    [classes.fontSize45]: card.name.length < 8,
  });
  return (
    <Paper
      className={paperClasses}
      onClick={() => dispatch(flipGameCardRequest(card.state))}>
      {(!card.state.flipped || gameOver) && card.name}
    </Paper>
  );
};

export default memo(GameCard);
