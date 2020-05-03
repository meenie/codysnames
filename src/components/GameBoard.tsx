import React, { memo, useState } from 'react';
import { Grid, Button, Box, Typography, Paper } from '@material-ui/core';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import classnames from 'classnames';
import isEqual from 'lodash/isEqual';
import { useDispatch, useSelector } from 'react-redux';
import { Skeleton } from '@material-ui/lab';

import { useCollection } from '../hooks/useCollection';
import { db } from '../services/firebase';
import { Root } from '../state/root.types';
import { Game } from '../state/game/game.types';
import { GameCard as IGameCard } from '../state/gameCard/gameCard.types';
import { GameClue as IGameClue } from '../state/gameClue/gameClue.types';
import { endTurnRequest, switchTeamsRequest } from '../state/game/game.actions';
import { databasePushUpdate as databasePushGameClueUpdate } from '../state/gameClue/gameClue.actions';
import {
  databasePushGameCardUpdate,
  databasePushGameCardStateUpdate,
} from '../state/gameCard/gameCard.actions';
import {
  getCurrentPlayerType,
  getCurrentPlayerColor,
} from '../state/player/player.selectors';
import { getGameCardsWithState } from '../state/gameCard/gameCard.selectors';
import GameCard from './GameCard';
import PlayerList from './PlayerList';
import GameClue from './GameClue';
import GameCluesList from './GameCluesList';

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
    redsTurn: {
      border: `1px solid ${theme.gameColor.red}`,
      padding: theme.spacing(0, 1),
      color: theme.gameColor.red,
    },
    bluesTurn: {
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
    loadingTile: {
      borderRadius: '4px',
    },
    playerList: {
      marginBottom: theme.spacing(2),
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
  const [ dialogOpen, setDialogOpen ] = useState(false);

  const switchTeamsHandler = () => {
    dispatch(switchTeamsRequest());
  };

  const whoWon = game.whoWon;
  const whosTurn = game.turn;
  const bluesTurn = whosTurn === Game.TeamColor.Blue;
  const redsTurn = whosTurn === Game.TeamColor.Red;
  const gameStatus = game.status;
  const yourTurn =
    currentPlayerColor === whosTurn && gameStatus === Game.Status.InSession;
  const clue = game.clue;
  const noOfGuesses = game.numberOfGuesses || -1;
  const isSpymaster = currentPlayerType === Game.PlayerType.Spymaster;
  let noOfGuessesText: string;
  if (noOfGuesses === 10) {
    noOfGuessesText = 'UNLIMITED';
  } else if (noOfGuesses === 9) {
    noOfGuessesText = 'ZERO';
  } else if (noOfGuesses === -1) {
    noOfGuessesText = '...';
  } else {
    noOfGuessesText = noOfGuesses.toString();
    if ((game.blueHasExtraGuess && bluesTurn) || (game.redHasExtraGuess && redsTurn)) {
      noOfGuessesText = noOfGuessesText.concat('+1');
    }
  }

  const turnClass = classnames({
    [classes.redsTurn]: redsTurn,
    [classes.bluesTurn]: bluesTurn,
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

  useCollection<IGameClue.Entity>(
    () =>
      db
        .collection('gameClues')
        .where('gameId', '==', game.id)
        .orderBy('createdAt', 'asc'),
    {
      data: (gameClues) => dispatch(databasePushGameClueUpdate(gameClues)),
      error: (error) => console.error(error),
      shouldConnect: game.status === Game.Status.Over,
    },
    [ game.id, game.status ]
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

  return (
    <Box className={classes.root}>
      <GameClue
        open={dialogOpen}
        onCancel={() => setDialogOpen(false)}
        onSubmit={() => setDialogOpen(false)}
      />
      <Grid container className={classes.cards} spacing={2} justify="center">
        <Grid item xs={2} style={{ textAlign: 'center' }}>
          {!isSpymaster &&
          bluesTurn &&
          yourTurn && (
            <Button
              variant="outlined"
              size="small"
              onClick={() => dispatch(endTurnRequest())}>
              Done With Turn
            </Button>
          )}
          {isSpymaster &&
          bluesTurn &&
          yourTurn &&
          !clue && (
            <Button variant="outlined" size="small" onClick={() => setDialogOpen(true)}>
              Submit Clue
            </Button>
          )}
        </Grid>
        <Grid item xs={8}>
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
              <span>
                Turn: <span className={turnClass}>{whosTurn}</span>&nbsp;&nbsp;
              </span>
              <span>
                Clue: <span className={turnClass}>{clue || '...'}</span>&nbsp;&nbsp;
              </span>
              <span>
                Guesses: <span className={turnClass}>{noOfGuessesText}</span>
              </span>
            </Typography>
          )}
        </Grid>
        <Grid item xs={2} style={{ textAlign: 'center' }}>
          {!isSpymaster &&
          redsTurn &&
          yourTurn && (
            <Button
              variant="outlined"
              size="small"
              onClick={() => dispatch(endTurnRequest())}>
              Done With Turn
            </Button>
          )}
          {isSpymaster &&
          redsTurn &&
          yourTurn &&
          !clue && (
            <Button variant="outlined" size="small" onClick={() => setDialogOpen(true)}>
              Submit Clue
            </Button>
          )}
        </Grid>
        <Grid item xs={2}>
          <Paper className={classes.playerList}>
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
          {gameStatus === Game.Status.Over && (
            <Paper>
              <GameCluesList teamColor={Game.TeamColor.Blue} />
            </Paper>
          )}
        </Grid>
        <Grid item xs={8}>
          <Grid container spacing={2} justify="center">
            {cards.length === 0 &&
              Array(25).fill(null).map((_, i) => (
                <Grid key={`skeleton-${i}`} item>
                  <Skeleton
                    className={classes.loadingTile}
                    variant="rect"
                    width={140}
                    height={120}
                    animation="wave"
                  />
                </Grid>
              ))}
            {cards.map((card) => (
              <Grid key={card.id} item>
                <GameCard card={card} />
              </Grid>
            ))}
          </Grid>
        </Grid>
        <Grid item xs={2}>
          <Paper className={classes.playerList}>
            <PlayerList
              teamColor="red"
              agents={redAgents}
              spymaster={redSpymaster}
              teamName="Red Team"
              showJoinTeamButton={
                playerType === Game.PlayerType.Agent && playerColor !== Game.TeamColor.Red
              }
              showPromoteButton={false}
              switchTeams={switchTeamsHandler}
            />
          </Paper>
          {gameStatus === Game.Status.Over && (
            <Paper>
              <GameCluesList teamColor={Game.TeamColor.Red} />
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default memo(GameBoard);
