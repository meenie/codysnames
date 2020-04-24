import React, { memo } from "react";
import { Grid, Button, Box, Typography } from "@material-ui/core";
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import classnames from 'classnames';
import isEqual from 'lodash/isEqual';

import GameCard from "../components/GameCard";
import { Store } from "../store/types";
import { useDispatch, useSelector } from "react-redux";
import { doneWithTurn } from "../store/effects";
import { getCurrentPlayerType, getCurrentPlayerColor } from "../store/selectors";

const useStyles = makeStyles((theme: Theme) => createStyles({
  root: {
    marginTop: theme.spacing(5),
    position: 'relative'
  },
  whosTurn: {
    color: 'aliceBlue',
    textAlign: 'center',
    '& button': {
      position: 'absolute',
      right: 1
    }
  },
  cards: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
  },
  redTurn: {
    border: `1px solid ${theme.gameColor.red}`,
    padding: theme.spacing(0, 1),
    color: theme.gameColor.red
  },
  blueTurn: {
    border: `1px solid ${theme.gameColor.blue}`,
    padding: theme.spacing(0, 1),
    color: theme.gameColor.blue
  },
  gameOver: {
    textAlign: 'center'
  },
  winner: {
    textAlign: 'center'
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
      fontSize: '1.8rem'
    }
  },
  loading: {
    color: 'white',
    position: 'absolute',
    right: 'calc(50% - 20px)',
    top: '170px'
  }
}));

const GameBoard: React.FC = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const cards = useSelector((state: Store.ApplicationState) => state.gameCards, isEqual);
  const game = useSelector((state: Store.ApplicationState) => state.game, isEqual);
  const currentPlayerType = useSelector(getCurrentPlayerType);
  const currentPlayerColor = useSelector(getCurrentPlayerColor);

  const whoWon = game.whoWon;
  const whosTurn = game.turn;
  const gameStatus = game.status;
  const yourTurn = currentPlayerColor === whosTurn;
  const isSpymaster = currentPlayerType === Store.PlayerType.Spymaster;

  const turnClass = classnames({
    [classes.redTurn]: whosTurn === Store.TeamColor.Red,
    [classes.blueTurn]: whosTurn === Store.TeamColor.Blue
  });

  if (cards.length === 0) {
    return <p>&nbsp;</p>
  }

  return (
    <Box className={classes.root}>
      {
        gameStatus === Store.Status.Over &&
        (
          <React.Fragment>
            <Typography variant="h4" className={classes.gameOver}>Game over, man! Game over!</Typography>
            <Typography variant="h4" className={classes.winner}>{whoWon} is the winner!!</Typography>
          </React.Fragment>
        )
      }

      {gameStatus !== Store.Status.Over && (<Typography variant="h5" className={classes.whosTurn}>
        Team Turn: <span className={turnClass}>{whosTurn}</span>&nbsp;&nbsp;
        {
          !isSpymaster && yourTurn && (
            <Button
              variant="outlined"
              onClick={() => dispatch(doneWithTurn())}>
              Done With Turn
            </Button>
          )
        }
      </Typography>)}

      <Grid container spacing={2} className={classes.cards}>
        {cards.map((card) => (
          <Grid key={card.id} item>
            <GameCard card={card} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default memo(GameBoard);
