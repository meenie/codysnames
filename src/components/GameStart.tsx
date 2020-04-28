import React, { memo, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { TextField, Button, Grid, Typography } from '@material-ui/core';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

import { createGameRequest } from '../state/game/game.actions';
import { joinGameRequest } from '../state/player/player.actions';
import { Root } from "../state/root.types";


const useStyles = makeStyles((theme: Theme) => createStyles({
  title: {
    textAlign: 'center'
  },
  gameCodeContainer: {
    textAlign: 'center'
  },
  gameCodeTextField: {
    width: '190px',
    '& input': {
      fontSize: '2rem',
      textTransform: 'uppercase',
      textAlign: 'center',
      padding: '15px'
    },
    '& label': {
      lineHeight: '1.9rem'
    }
  }
}))

const GameStart: React.FC = () => {
  const classes = useStyles();
  const [gameId, setGameId] = useState<string | undefined>();
  const creatingGame = useSelector((state: Root.State) => state.game.creating);
  const dispatch = useDispatch();

  return (
    <React.Fragment>
      <Grid container item xs={12} spacing={2}>
        <Grid item xs={5} className={classes.title}>
          <Typography variant="h5">Join a Game</Typography>
        </Grid>
        <Grid item xs={2} className={classes.title}>
          <Typography variant="h6">Or</Typography>
        </Grid>
        <Grid item xs={5} className={classes.title}>
          <Typography variant="h5">Create a Game</Typography>
        </Grid>
      </Grid>
      <Grid container item xs={12} spacing={3}>
        <Grid item xs={5} className={classes.gameCodeContainer}>
          <TextField
            variant="outlined"
            label="Game Code (i.e. EIKH)"
            helperText="Hit enter to submit"
            className={classes.gameCodeTextField}
            inputProps={{ maxLength: 4 }}
            onChange={(ev) => setGameId(ev.target.value)}
            onKeyPress={(ev) => {
              if (ev.key === 'Enter' && gameId && gameId.length === 4) {
                dispatch(joinGameRequest(gameId.toLowerCase()))
                ev.preventDefault();
              }
            }} />
        </Grid>
        <Grid item xs={2}>&nbsp;</Grid>
        <Grid item xs={5}>
          <Button
            color="primary"
            variant="contained"
            fullWidth
            disabled={creatingGame}
            onClick={() => dispatch(createGameRequest())}
          >
            {creatingGame ? 'Creating Game...' : 'Create Game'}
          </Button>
        </Grid>
      </Grid>
    </React.Fragment>
  );
}

export default memo(GameStart);
