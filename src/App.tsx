import React, { useEffect, memo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Typography, CircularProgress, Container, Fade } from '@material-ui/core';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import { ApolloProvider } from '@apollo/react-hooks';

import { signInPlayerRequest } from './state/player/player.actions';
import Home from './pages/Home';
import Game from './pages/Game';
import { Root } from './state/root.types';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {},
    title: {
      fontFamily: `'Shadows Into Light', cursive`,
      textAlign: 'center',
      marginBottom: theme.spacing(4),
      marginTop: theme.spacing(1),
      fontSize: '3.5rem',
    },
    loading: {
      color: 'white',
      position: 'absolute',
      right: 'calc(50% - 20px)',
      bottom: 'calc(85% - 20px)',
    },
  })
);

const App: React.FC = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state: Root.State) => !!state.player.data.id);
  const gameLoaded = useSelector((state: Root.State) => state.game.loaded);
  const gameLoading = useSelector((state: Root.State) => state.game.loading);
  const gameId = useSelector((state: Root.State) => state.game.data.id);
  const client = useSelector((state: Root.State) => state.apollo.client);

  useEffect(
    () => {
      dispatch(signInPlayerRequest());
    },
    [ dispatch ]
  );

  return (
    <Box className={classes.root}>
      <Fade in={!isLoggedIn || gameLoading}>
        <CircularProgress className={classes.loading} />
      </Fade>
      {isLoggedIn &&
      !gameLoading &&
      client && (
        <ApolloProvider client={client}>
          <Container className={classes.root}>
            <Typography variant="h1" className={classes.title}>
              CODYSNAMES
            </Typography>
            {gameLoaded && <Game gameId={gameId} />}
            {!gameLoaded && <Home />}
          </Container>
        </ApolloProvider>
      )}
    </Box>
  );
};

export default memo(App);
