import React, { memo } from "react";
import {
  ListItemIcon, ListSubheader, ListItemText, ListItem,
  List, Typography, Button, ListItemSecondaryAction,
  IconButton, Tooltip
} from "@material-ui/core";
import {
  LocalLibrary as LocalLibraryIcon,
  AccountBox as AccountBoxIcon,
  ArrowUpward as ArrowUpwardIcon
} from '@material-ui/icons';
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import { Player } from "../state/player/player.types";

const useStyles = makeStyles((theme: Theme) => createStyles({
  root: {},
  icon: (props: { teamColor: 'red' | 'blue' }) => ({
    color: theme.gameColor[props.teamColor]
  }),
  notFilled: {
    color: 'grey'
  },
  listHeader: {
    position: 'relative',
    '& button': {
      position: 'absolute',
      right: 0
    }
  }
}));

const Lobby: React.FC<{
  teamColor: 'red' | 'blue';
  agents: Player.Entity[];
  spymaster: Player.Entity;
  teamName: string;
  showJoinTeamButton: boolean;
  showPromoteButton: boolean;
  promoteToSpymaster: (player: Player.Entity) => void;
  switchTeams: () => void;
}> = ({
  teamColor,
  agents,
  spymaster,
  teamName,
  promoteToSpymaster,
  switchTeams,
  showJoinTeamButton,
  showPromoteButton
}) => {
    const classes = useStyles({ teamColor });
    const noAgents = agents.length === 0;

    return (
      <List
        subheader={
          <ListSubheader>
            <Typography variant="h5" className={classes.listHeader}>
              {teamName}{" "}
              {showJoinTeamButton &&
                <Tooltip title="Join the other team">
                  <Button size="small" onClick={() => switchTeams()}>Join</Button>
                </Tooltip>
              }
            </Typography>
          </ListSubheader>
        }>
        <ListItem>
          <ListItemIcon >
            <Tooltip title="Spymaster">
              <LocalLibraryIcon className={classes.icon} />
            </Tooltip>
          </ListItemIcon>
          {!!spymaster.name && <ListItemText primary={spymaster.name} />}
          {!spymaster.name && <ListItemText className={classes.notFilled} primary="Not Filled" />}
        </ListItem>
        {noAgents && <ListItem>
          <ListItemIcon>
            <Tooltip title="Agent">
              <AccountBoxIcon className={classes.icon} />
            </Tooltip>
          </ListItemIcon>
          <ListItemText className={classes.notFilled} primary="Not Filled" />
        </ListItem>}
        {agents.map(agent =>
          <ListItem key={agent.id}>
            <ListItemIcon>
              <Tooltip title="Agent">
                <AccountBoxIcon className={classes.icon} />
              </Tooltip>
            </ListItemIcon>
            <ListItemText primary={agent.name} />
            {showPromoteButton && <ListItemSecondaryAction>
              <IconButton edge="end" onClick={() => promoteToSpymaster(agent)}>
                <Tooltip title="Promote to Spymaster">
                  <ArrowUpwardIcon className={classes.icon} />
                </Tooltip>
              </IconButton>
            </ListItemSecondaryAction>}
          </ListItem>
        )}
      </List>
    )
  };

export default memo(Lobby);
