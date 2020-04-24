import React, { memo } from "react";
import classnames from 'classnames';
import { Box, Typography, Button } from "@material-ui/core";
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

import { Store } from "../store/types";
import { useDispatch, useSelector } from "react-redux";
import { leaveGame } from "../store/effects";
import { getCurrentPlayerColor } from "../store/selectors";


const useStyles = makeStyles((theme: Theme) => createStyles({
  root: {
    position: 'absolute',
    left: theme.spacing(3),
    top: theme.spacing(3)
  },
  gameInfo: {
    color: 'white',
    marginBottom: theme.spacing(2),
    fontSize: '1rem',
    '& span': {
      textTransform: 'uppercase',
      fontWeight: 'bolder',
      fontFamily: 'monospace',
      fontSize: '1.5rem'
    }
  },
  redColor: {
    border: `1px solid ${theme.gameColor.red}`,
    padding: theme.spacing(0, 1),
    color: theme.gameColor.red
  },
  blueColor: {
    border: `1px solid ${theme.gameColor.blue}`,
    padding: theme.spacing(0, 1),
    color: theme.gameColor.blue
  },
}));

const GameInfo: React.FC = () => {
  const classes = useStyles();
  const dispatch = useDispatch();

  const playerName = useSelector((state: Store.ApplicationState) => state.player.name);
  const gameId = useSelector((state: Store.ApplicationState) => state.game.id);
  const currentPlayerColor = useSelector(getCurrentPlayerColor);

  const colorTag = classnames({
    [classes.redColor]: currentPlayerColor === Store.TeamColor.Red,
    [classes.blueColor]: currentPlayerColor === Store.TeamColor.Blue
  })

  return (
    <Box className={classes.root}>
      <Typography className={classes.gameInfo} variant="h5">
        Code: <span>{gameId}</span><br />
        Name: <span>{playerName}</span><br />
        Color: <span className={colorTag}>{currentPlayerColor}</span>
      </Typography>
      <Button
        size="small"
        variant="outlined"
        onClick={() => dispatch(leaveGame())}>
        Leave Game
      </Button>
    </Box>
  );
}

export default memo(GameInfo);
