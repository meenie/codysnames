import React, { memo, useState } from 'react';
import { Grid, Button, Box, Typography, Paper } from '@material-ui/core';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import classnames from 'classnames';
import isEqual from 'lodash/isEqual';
import { useDispatch, useSelector } from 'react-redux';
import { Skeleton } from '@material-ui/lab';

import { Root } from '../state/root.types';
import { Game } from '../state/game/game.types';
import { endTurnRequest, switchTeamsRequest } from '../state/game/game.actions';
import {
  getCurrentPlayerType,
  getCurrentPlayerColor,
} from '../state/player/player.selectors';
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
  const game = useSelector((state: Root.State) => state.game.data, isEqual);
  const currentPlayerType = useSelector(getCurrentPlayerType);
  const currentPlayerColor = useSelector(getCurrentPlayerColor);
  const {
    red_spymaster: redSpymaster,
    blue_spymaster: blueSpymaster,
    red_agents: redAgents,
    blue_agents: blueAgents,
  } = useSelector((state: Root.State) => state.game.data);
  const playerType = useSelector(getCurrentPlayerType);
  const playerColor = useSelector(getCurrentPlayerColor);
  const [ dialogOpen, setDialogOpen ] = useState(false);

  const switchTeamsHandler = () => {
    dispatch(switchTeamsRequest());
  };

  const whoWon = game.who_won && game.who_won.toUpperCase();
  const whosTurn = game.turn;
  const bluesTurn = whosTurn === Game.TeamColor.Blue;
  const redsTurn = whosTurn === Game.TeamColor.Red;
  const gameStatus = game.status;
  const yourTurn =
    currentPlayerColor === whosTurn && gameStatus === Game.Status.InSession;
  const clue = game.clue;
  const noOfGuesses = game.number_of_guesses || -1;
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
    if (
      (game.blue_has_extra_guess && bluesTurn) ||
      (game.red_has_extra_guess && redsTurn)
    ) {
      noOfGuessesText = noOfGuessesText.concat('+1');
    }
  }

  const turnClass = classnames({
    [classes.redsTurn]: redsTurn,
    [classes.bluesTurn]: bluesTurn,
  });

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
            {game.cards.length === 0 &&
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
            {game.cards.map((card) => (
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
