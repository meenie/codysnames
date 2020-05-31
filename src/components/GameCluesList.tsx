import React, { memo } from 'react';
import {
  ListSubheader,
  ListItemText,
  ListItem,
  List,
  Typography,
} from '@material-ui/core';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { useSelector } from 'react-redux';

import { Game } from '../state/game/game.types';
import { Root } from '../state/root.types';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {},
    headerText: {
      textTransform: 'capitalize',
    },
  })
);

const getNumberOfGuessesText = (num: number) => {
  let ret = '';

  if (num === 10) {
    ret = 'UNLIMITED';
  } else if (num === 9) {
    ret = 'ZERO';
  } else {
    ret = num.toString();
  }

  return ret;
};

const GameCluesList: React.FC<{
  teamColor: Game.TeamColor;
}> = ({ teamColor }) => {
  const classes = useStyles();
  const gameClues = useSelector((state: Root.State) =>
    state.game.data.clues.filter((clue) => clue.color === teamColor)
  );

  return (
    <List
      className={classes.root}
      subheader={
        <ListSubheader>
          <Typography variant="h5" className={classes.headerText}>
            {teamColor} Clues
          </Typography>
        </ListSubheader>
      }>
      {gameClues.map((clue) => (
        <ListItem key={clue.id}>
          <ListItemText
            primary={`${clue.clue}: ${getNumberOfGuessesText(clue.number_of_guesses)}`}
          />
        </ListItem>
      ))}
    </List>
  );
};

export default memo(GameCluesList);
