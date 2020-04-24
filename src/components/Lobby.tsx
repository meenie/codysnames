import React, { memo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Grid, Box, Button, Typography, Paper } from '@material-ui/core';
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";

import { Store } from "../store/types";
import PlayerList from "./PlayerList";
import { promotePlayerToSpymaster, switchTeams, startGame } from "../store/effects";
import { getCurrentPlayerType, getCurrentPlayerColor } from "../store/selectors";


const useStyles = makeStyles((theme: Theme) => createStyles({
  root: {
    textAlign: 'center'
  },
  startGame: {
    marginBottom: theme.spacing(3)
  }
}));

const Lobby: React.FC = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [gameStarting, setGameStarting] = useState(false);
  const {
    redSpymaster,
    blueSpymaster,
    redAgents,
    blueAgents,
    id
  } = useSelector((state: Store.ApplicationState) => state.game);
  const playerType = useSelector(getCurrentPlayerType);
  const playerColor = useSelector(getCurrentPlayerColor);
  const isBlueSpymaster = playerType === Store.PlayerType.Spymaster && playerColor === Store.TeamColor.Blue;

  const promoteToSpymasterHandler = (player: Store.Player) => {
    dispatch(promotePlayerToSpymaster(player))
  }

  const switchTeamsHandler = () => {
    dispatch(switchTeams())
  }

  const canStartGame =
    !!blueSpymaster &&
    !!redSpymaster &&
    blueAgents.length > 0 &&
    redAgents.length > 0

  return (
    <Box className={classes.root}>
      {isBlueSpymaster && <Box className={classes.startGame}>
        {canStartGame && <Button
          variant="contained"
          color="primary"
          disabled={gameStarting}
          onClick={() => {
            setGameStarting(true)
            dispatch(startGame(id))
          }}>
          {gameStarting ? 'Game Starting...' : 'Start Game'}
        </Button>}
        {!canStartGame && <Typography>There needs to be at least 4 players to start the game!</Typography>}
      </Box>}
      <Grid container item xs={12} spacing={2} justify="center" alignItems="flex-start">
        <Grid item xs={4}>
          <Paper>
            <PlayerList
              teamColor="blue"
              agents={blueAgents}
              spymaster={blueSpymaster}
              teamName="Blue Team"
              showJoinTeamButton={playerType === Store.PlayerType.Agent && playerColor !== Store.TeamColor.Blue}
              showPromoteButton={playerType === Store.PlayerType.Spymaster && playerColor === Store.TeamColor.Blue}
              promoteToSpymaster={promoteToSpymasterHandler}
              switchTeams={switchTeamsHandler} />
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper>
            <PlayerList
              teamColor="red"
              agents={redAgents}
              spymaster={redSpymaster}
              teamName="Red Team"
              showJoinTeamButton={playerType === Store.PlayerType.Agent && playerColor !== Store.TeamColor.Red}
              showPromoteButton={playerType === Store.PlayerType.Spymaster && playerColor === Store.TeamColor.Red}
              promoteToSpymaster={promoteToSpymasterHandler}
              switchTeams={switchTeamsHandler} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
};

export default memo(Lobby);
