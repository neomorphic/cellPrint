/* global VERSION */
import React from 'react';

import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Icon from '@material-ui/core/Icon';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  root: {
    flexGrow: 1,
    margin: theme.spacing.unit * 2
  },
  centered: {
    textAlign: 'center'
  },
  spaced: {
    margin: '1em 0'
  }
});

class About extends React.Component {
  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <Typography variant="h3" className={classes.centered}>
          neuPrint Explorer
        </Typography>
        <Typography variant="body1" className={classes.centered}>
          Version: {VERSION}
        </Typography>
        <Divider light={true} className={classes.spaced} />
        <Typography variant="h6">About:</Typography>
        <Typography variant="body1" className={classes.spaced}>
          neuPrint Explorer is web based tool to query and visualize connectomic data stored in
          neuPrint, a neo4j graph database of the connectome.{' '}
        </Typography>

        <Typography variant="h6">Contact us:</Typography>
        <Typography variant="body1" className={classes.spaced}>
          <Icon>mail_outline</Icon>
          <a href="mailto:neuprint@janelia.hhmi.org">
            neuprint@janelia.hhmi.org
          </a>
        </Typography>
      </div>
    );
  }
}

export default withStyles(styles)(About);