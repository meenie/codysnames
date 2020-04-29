import React, { memo } from 'react';
import { useSelector } from 'react-redux';
import { Box, Grid, Paper } from '@material-ui/core';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

import PlayerName from '../components/PlayerName';
import GameStart from '../components/GameStart';
import { Root } from '../state/root.types';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    paper: {
      padding: theme.spacing(2),
      margin: 'auto',
      maxWidth: 700,
    },
  })
);

const Home: React.FC = () => {
  const classes = useStyles();
  const nameSet = useSelector((state: Root.State) => !!state.player.data.name);

  return (
    <Box className={classes.root}>
      <Paper className={classes.paper}>
        <Grid container spacing={1} justify="center" alignItems="center">
          <PlayerName />
          {nameSet && <GameStart />}
        </Grid>
      </Paper>
    </Box>
  );
};

export default memo(Home);
