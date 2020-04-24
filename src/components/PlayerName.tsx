import React, { memo, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { Tooltip, Grid, TextField, Typography, IconButton } from '@material-ui/core';
import { Edit as EditIcon } from '@material-ui/icons';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

import { setPlayerName } from '../store/effects';
import { Store } from "../store/types";


const useStyles = makeStyles((theme: Theme) => createStyles({
  title: {
    textAlign: 'center'
  },
  nameTextArea: {
    '& input': {
      textTransform: 'uppercase'
    }
  }
}))

const PlayerName: React.FC = () => {
  const classes = useStyles();
  const currentName = useSelector((state: Store.ApplicationState) => state.player.name);
  const [name, setName] = useState(currentName);
  const [editingName, setEditingName] = useState(!currentName);
  const dispatch = useDispatch();

  return (
    <React.Fragment>
      {!editingName && currentName && <React.Fragment>
        <Typography variant="h5">
          Hey {currentName}!{" "}
          <Tooltip title="Edit your name">
            <IconButton
              aria-label="Edit Name"
              onClick={() => setEditingName(true)}
              size="small"
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
        </Typography>
      </React.Fragment>}
      {(editingName || !currentName) && <React.Fragment>
        <Grid container item xs={12} spacing={3}>
          <Grid item xs={3} className={classes.title}>
            <Typography variant="h5">&nbsp;</Typography>
          </Grid>
          <Grid item xs={6} className={classes.title}>
            <Typography variant="h5">Set Your Name</Typography>
          </Grid>
        </Grid>
        <Grid container item xs={12} spacing={3}>
          <Grid item xs={3} className={classes.title}>
            &nbsp;
          </Grid>
          <Grid item xs={6}>
            <TextField
              variant="outlined"
              label="Set player name"
              value={name}
              helperText="Hit enter to submit"
              fullWidth
              className={classes.nameTextArea}
              inputProps={{ maxLength: 15 }}
              onChange={(ev) => setName(ev.target.value.toUpperCase())}
              onKeyPress={(ev) => {
                if (ev.key === 'Enter') {
                  setEditingName(false);
                  dispatch(setPlayerName(name))
                  ev.preventDefault();
                }
              }} />
          </Grid>
        </Grid>
      </React.Fragment>}
    </React.Fragment>
  );
}

export default memo(PlayerName);
