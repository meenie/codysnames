import React, { memo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Grid, Box, Button, Typography, Paper } from '@material-ui/core';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';

import PlayerList from './PlayerList';
import {
  promoteToSpymasterRequest,
  switchTeamsRequest,
  startGameRequest,
} from '../state/game/game.actions';
import {
  getCurrentPlayerType,
  getCurrentPlayerColor,
} from '../state/player/player.selectors';
import { Root } from '../state/root.types';
import { Game } from '../state/game/game.types';
import { Player } from '../state/player/player.types';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      textAlign: 'center',
    },
    startGame: {
      marginBottom: theme.spacing(3),
    },
  })
);

const Lobby: React.FC = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const gameStarting = useSelector((state: Root.State) => state.game.starting);
  const { red_spymaster, blue_spymaster, red_agents, blue_agents, id } = useSelector(
    (state: Root.State) => state.game.data
  );

  const playerType = useSelector(getCurrentPlayerType);
  const playerColor = useSelector(getCurrentPlayerColor);
  const isBlueSpymaster =
    playerType === Game.PlayerType.Spymaster && playerColor === Game.TeamColor.Blue;

  const promoteToSpymasterHandler = (player: Player.Entity) => {
    dispatch(promoteToSpymasterRequest(player));
  };

  const switchTeamsHandler = () => {
    dispatch(switchTeamsRequest());
  };

  const canStartGame =
    !!blue_spymaster &&
    !!red_spymaster &&
    blue_agents.length > 0 &&
    red_agents.length > 0;

  return (
    <Box className={classes.root}>
      {isBlueSpymaster && (
        <Box className={classes.startGame}>
          {canStartGame && (
            <Button
              variant="contained"
              color="primary"
              disabled={gameStarting}
              onClick={() => {
                dispatch(startGameRequest(id));
              }}>
              {gameStarting ? 'Game Starting...' : 'Start Game'}
            </Button>
          )}
          {!canStartGame && (
            <Typography>
              There needs to be at least 4 players to start the game!
            </Typography>
          )}
        </Box>
      )}
      <Grid container item xs={12} spacing={2} justify="center" alignItems="flex-start">
        <Grid item xs={4}>
          <Paper>
            <PlayerList
              teamColor="blue"
              agents={blue_agents}
              spymaster={blue_spymaster}
              teamName="Blue Team"
              showJoinTeamButton={
                playerType === Game.PlayerType.Agent &&
                playerColor !== Game.TeamColor.Blue
              }
              showPromoteButton={
                playerType === Game.PlayerType.Spymaster &&
                playerColor === Game.TeamColor.Blue
              }
              promoteToSpymaster={promoteToSpymasterHandler}
              switchTeams={switchTeamsHandler}
            />
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper>
            <PlayerList
              teamColor="red"
              agents={red_agents}
              spymaster={red_spymaster}
              teamName="Red Team"
              showJoinTeamButton={
                playerType === Game.PlayerType.Agent && playerColor !== Game.TeamColor.Red
              }
              showPromoteButton={
                playerType === Game.PlayerType.Spymaster &&
                playerColor === Game.TeamColor.Red
              }
              promoteToSpymaster={promoteToSpymasterHandler}
              switchTeams={switchTeamsHandler}
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default memo(Lobby);
