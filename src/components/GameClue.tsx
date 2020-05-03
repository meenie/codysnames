import React, { memo, useState } from 'react';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  TextField,
  DialogActions,
  Button,
  Grid,
  Paper,
  Typography,
} from '@material-ui/core';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import { useSelector, useDispatch } from 'react-redux';
import classnames from 'classnames';

import { Root } from '../state/root.types';
import { createGameClueRequest } from '../state/gameClue/gameClue.actions';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {},
    number: {
      fontFamily: `'Shadows Into Light', cursive`,
      fontSize: '2rem',
      padding: 20,
      cursor: 'pointer',
    },
    selected: {
      backgroundColor: '#333333',
    },
  })
);

const GameClue: React.FC<{
  open: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}> = ({ open, onCancel, onSubmit }) => {
  const game = useSelector((state: Root.State) => state.game.data);
  const [ clue, setClue ] = useState<undefined | string>();
  const [ numberOfGuesses, setNumberOfGuesses ] = useState<undefined | number>();
  const dispatch = useDispatch();
  const classes = useStyles();

  const submitClue = () => {
    if (clue && numberOfGuesses && numberOfGuesses > 0) {
      dispatch(
        createGameClueRequest({
          clue,
          numberOfGuesses,
          teamColor: game.turn,
          gameId: game.id,
        })
      );
      setClue('');
      setNumberOfGuesses(-1);
      onSubmit();
    }
  };

  const numberSelectedClasses = (num: number) => {
    return classnames({
      [classes.number]: true,
      [classes.selected]: num === numberOfGuesses,
    });
  };

  return (
    <Dialog open={open} aria-labelledby="form-dialog-title" className={classes.root}>
      <DialogTitle id="form-dialog-title">Submit Clue</DialogTitle>
      <DialogContent>
        <DialogContentText>Submit your clue and the number of guesses.</DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id="clue"
          label="Clue"
          fullWidth
          onChange={(ev) => setClue(ev.target.value.toUpperCase())}
        />

        <Typography>Number of Guesses</Typography>
        <Grid container spacing={2} justify="center">
          <Grid item>
            <Paper
              className={numberSelectedClasses(1)}
              onClick={() => setNumberOfGuesses(1)}>
              1
            </Paper>
          </Grid>
          <Grid item>
            <Paper
              className={numberSelectedClasses(2)}
              onClick={() => setNumberOfGuesses(2)}>
              2
            </Paper>
          </Grid>
          <Grid item>
            <Paper
              className={numberSelectedClasses(3)}
              onClick={() => setNumberOfGuesses(3)}>
              3
            </Paper>
          </Grid>
        </Grid>

        <Grid container spacing={2} justify="center">
          <Grid item>
            <Paper
              className={numberSelectedClasses(4)}
              onClick={() => setNumberOfGuesses(4)}>
              4
            </Paper>
          </Grid>
          <Grid item>
            <Paper
              className={numberSelectedClasses(5)}
              onClick={() => setNumberOfGuesses(5)}>
              5
            </Paper>
          </Grid>
          <Grid item>
            <Paper
              className={numberSelectedClasses(6)}
              onClick={() => setNumberOfGuesses(6)}>
              6
            </Paper>
          </Grid>
        </Grid>
        <Grid container spacing={2} justify="center">
          <Grid item>
            <Paper
              className={numberSelectedClasses(7)}
              onClick={() => setNumberOfGuesses(7)}>
              7
            </Paper>
          </Grid>
          <Grid item>
            <Paper
              className={numberSelectedClasses(8)}
              onClick={() => setNumberOfGuesses(8)}>
              8
            </Paper>
          </Grid>
        </Grid>
        <Grid container spacing={2} justify="center">
          <Grid item>
            <Paper
              className={numberSelectedClasses(9)}
              onClick={() => setNumberOfGuesses(9)}>
              ZERO
            </Paper>
          </Grid>
          <Grid item>
            <Paper
              className={numberSelectedClasses(10)}
              onClick={() => setNumberOfGuesses(10)}>
              UNLIMITED
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button color="primary" onClick={() => submitClue()}>
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default memo(GameClue);
