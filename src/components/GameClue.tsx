import React, { memo, useState } from 'react';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  TextField,
  DialogActions,
  Button,
} from '@material-ui/core';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import { useSelector, useDispatch } from 'react-redux';

import { Root } from '../state/root.types';
import { createGameClueRequest } from '../state/gameClue/gameClue.actions';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {},
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

      onSubmit();
    }
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
          onChange={(ev) => setClue(ev.target.value.toUpperCase())}
        />
        <TextField
          margin="dense"
          id="numberOfGuesses"
          label="Number of guesses"
          onChange={(ev) => setNumberOfGuesses(parseInt(ev.target.value, 10))}
        />
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
