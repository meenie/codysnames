import React, { useEffect, memo } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { Box, Typography, CircularProgress, Container, Fade } from '@material-ui/core';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

import { Store } from './store/types';
import { signInPlayer } from "./store/effects";
import Home from "./pages/Home";
import Game from "./pages/Game";

const useStyles = makeStyles((theme: Theme) => createStyles({
  root: {
  },
  title: {
    fontFamily: `'Shadows Into Light', cursive`,
    textAlign: 'center',
    marginBottom: theme.spacing(4),
    marginTop: theme.spacing(1),
    fontSize: '3.5rem'
  },
  loading: {
    color: 'white',
    position: 'absolute',
    right: 'calc(50% - 20px)',
    bottom: 'calc(85% - 20px)'
  }
}))

const App: React.FC = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state: Store.ApplicationState) => !!state.player.id);
  const currentGameId = useSelector((state: Store.ApplicationState) => state.player.currentGameId);
  const leavingGame = useSelector((state: Store.ApplicationState) => state.loading.leavingGame);

  useEffect(() => {
    dispatch(signInPlayer());
  }, [dispatch])

  return (
    <Box className={classes.root}>
      <Fade in={!isLoggedIn}><CircularProgress className={classes.loading} /></Fade>
      {isLoggedIn && <Container className={classes.root} maxWidth="md">
        <Typography variant="h1" className={classes.title}>CODYSNAMES</Typography>
        {!leavingGame && currentGameId && <Game gameId={currentGameId} />}
        {(!currentGameId || leavingGame) && <Home />}
      </Container>}
    </Box>
  );
}

export default memo(App);
