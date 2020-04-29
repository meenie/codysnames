import React, { memo } from 'react';
import { Grid, Button, Box, Typography, Paper } from '@material-ui/core';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import classnames from 'classnames';
import isEqual from 'lodash/isEqual';
import { useDispatch, useSelector } from 'react-redux';

import GameCard from '../components/GameCard';
import { Root } from '../state/root.types';
import { Game } from '../state/game/game.types';
import { GameCard as IGameCard } from '../state/gameCard/gameCard.types';
import { endTurnRequest, switchTeamsRequest } from '../state/game/game.actions';
import {
  databasePushGameCardUpdate,
  databasePushGameCardStateUpdate,
} from '../state/gameCard/gameCard.actions';
import {
  getCurrentPlayerType,
  getCurrentPlayerColor,
} from '../state/player/player.selectors';
import { getGameCardsWithState } from '../state/gameCard/gameCard.selectors';
import { useCollection } from '../hooks/useCollection';
import { db } from '../services/firebase';
import PlayerList from './PlayerList';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      marginTop: theme.spacing(5),
      position: 'relative',
    },
    whosTurn: {
      color: 'aliceBlue',
      textAlign: 'center',
      '& button': {
        position: 'absolute',
        right: 1,
      },
    },
    cards: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
    },
    redTurn: {
      border: `1px solid ${theme.gameColor.red}`,
      padding: theme.spacing(0, 1),
      color: theme.gameColor.red,
    },
    blueTurn: {
      border: `1px solid ${theme.gameColor.blue}`,
      padding: theme.spacing(0, 1),
      color: theme.gameColor.blue,
    },
    gameOver: {
      textAlign: 'center',
    },
    winner: {
      textAlign: 'center',
    },
    gameCode: {
      position: 'absolute',
      right: theme.spacing(3),
      top: theme.spacing(3),

      color: 'white',
      '& span': {
        textTransform: 'uppercase',
        fontWeight: 'bolder',
        fontFamily: 'monospace',
        fontSize: '1.8rem',
      },
    },
  })
);

const GameBoard: React.FC = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const cards = useSelector(getGameCardsWithState, isEqual);
  const game = useSelector((state: Root.State) => state.game.data, isEqual);
  const currentPlayerType = useSelector(getCurrentPlayerType);
  const currentPlayerColor = useSelector(getCurrentPlayerColor);
  const leavingGame = useSelector((state: Root.State) => state.game.leaving);
  const { redSpymaster, blueSpymaster, redAgents, blueAgents } = useSelector(
    (state: Root.State) => state.game.data
  );
  const playerType = useSelector(getCurrentPlayerType);
  const playerColor = useSelector(getCurrentPlayerColor);

  const switchTeamsHandler = () => {
    dispatch(switchTeamsRequest());
  };

  const whoWon = game.whoWon;
  const whosTurn = game.turn;
  const gameStatus = game.status;
  const yourTurn = currentPlayerColor === whosTurn;
  const isSpymaster = currentPlayerType === Game.PlayerType.Spymaster;

  const turnClass = classnames({
    [classes.redTurn]: whosTurn === Game.TeamColor.Red,
    [classes.blueTurn]: whosTurn === Game.TeamColor.Blue,
  });

  useCollection<IGameCard.GameCardEntity>(
    () =>
      db.collection('gameCards').where('gameId', '==', game.id).orderBy('order', 'asc'),
    {
      data: (gameCards) =>
        !leavingGame && dispatch(databasePushGameCardUpdate(gameCards)),
    },
    [ game.id ]
  );

  useCollection<IGameCard.GameCardStateEntity>(
    () => {
      const query = db.collection('gameCardState').where('gameId', '==', game.id);

      if (
        currentPlayerType === Game.PlayerType.Agent &&
        game.status !== Game.Status.Over
      ) {
        return query.where('flipped', '==', true);
      }

      return query;
    },
    {
      data: (gameCardState) =>
        !leavingGame && dispatch(databasePushGameCardStateUpdate(gameCardState)),
    },
    [ game.id, currentPlayerType, game.status ]
  );

  if (cards.length === 0) {
    return <p>&nbsp;</p>;
  }

  return (
    <Box className={classes.root}>
      {gameStatus === Game.Status.Over && (
        <React.Fragment>
          <Typography variant="h4" className={classes.gameOver}>
            Game over, man! Game over!
          </Typography>
          <Typography variant="h4" className={classes.winner}>
            {whoWon} is the winner!!
          </Typography>
        </React.Fragment>
      )}

      {gameStatus !== Game.Status.Over && (
        <Typography variant="h5" className={classes.whosTurn}>
          Team Turn: <span className={turnClass}>{whosTurn}</span>&nbsp;&nbsp;
          {!isSpymaster &&
          yourTurn && (
            <Button variant="outlined" onClick={() => dispatch(endTurnRequest())}>
              Done With Turn
            </Button>
          )}
        </Typography>
      )}

      <Grid container className={classes.cards}>
        <Grid container justify="center">
          <Grid item xs={2}>
            <Paper>
              <PlayerList
                teamColor="blue"
                agents={blueAgents}
                spymaster={blueSpymaster}
                teamName="Blue Team"
                showJoinTeamButton={
                  playerType === Game.PlayerType.Agent &&
                  playerColor !== Game.TeamColor.Blue
                }
                showPromoteButton={false}
                switchTeams={switchTeamsHandler}
              />
            </Paper>
          </Grid>
          <Grid item xs={8}>
            <Grid container spacing={2} justify="center">
              {cards.map((card) => (
                <Grid key={card.id} item>
                  <GameCard card={card} />
                </Grid>
              ))}
            </Grid>
          </Grid>
          <Grid item xs={2}>
            <Paper>
              <PlayerList
                teamColor="red"
                agents={redAgents}
                spymaster={redSpymaster}
                teamName="Red Team"
                showJoinTeamButton={
                  playerType === Game.PlayerType.Agent &&
                  playerColor !== Game.TeamColor.Red
                }
                showPromoteButton={false}
                switchTeams={switchTeamsHandler}
              />
            </Paper>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default memo(GameBoard);
