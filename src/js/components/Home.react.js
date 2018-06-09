/*
 * Home page contains basic information for the page.
*/

"use strict";
import React from 'react';
import Typography from 'material-ui/Typography';
import { Redirect } from 'react-router-dom';
import _ from "underscore";
import PropTypes from 'prop-types';
import {withStyles} from 'material-ui/styles';
import { connect } from 'react-redux';
import Card from 'material-ui/Card';
import { CardContent } from 'material-ui/Card';
import Grid from 'material-ui/Grid';
import { Link } from 'react-router-dom';


const styles = () => ({
    root: {
        flexGrow: 1,
        flexWrap: "wrap",
        display: 'flex',
    },
    roottext: {
        maxWidth: 560,
        margin: "0 auto"
    },
    card: {
        minWidth: 275,
        maxWidth: 500,
        marginLeft: "auto"
    },
    card2: {
        minWidth: 275,
        maxWidth: 500,
    },
    title: {
        marginBottom: 16,
        fontSize: 14,
    },
});

class Home extends React.Component {
    constructor(props) {
        super(props);
    }
    
    // if only query string has updated, prevent re-render
    shouldComponentUpdate(nextProps, nextState) {
        nextProps.location["search"] = this.props.location["search"];
        return (!_.isEqual(nextProps, this.props) || !_.isEqual(nextState, this.state));
    }
   
    render() {
        const {classes} = this.props;
        var redirectHome = false;
        if (window.location.pathname !== '/') {
            redirectHome = true;
        }
        return (
            <div className={classes.root}>
                {redirectHome ? <Redirect to="/" /> : <div / >}
                <Grid 
                        container 
                        spacing={24}
                >
                    <Grid 
                            item 
                            xs={12}
                    >
                        <div className={classes.roottext}>
                            <Typography variant="title">
                                Analysis tools for conenctomics
                            </Typography>
                            <br />
                            <Typography variant="body1">
                                neuPrintExplorer provides tools to query and visualize connectomic data stored in  <a href="https://github.com/janelia-flyem/neuPrint">neuPrint</a>, which uses a neo4j graph database.
                            </Typography>
                        </div>
                    </Grid>
                    <Grid 
                            item 
                            xs={12}
                            sm={6}
                    >
                        <Card className={classes.card}>
                            <CardContent>
                              <Typography
                                            className={classes.title}
                                            color="textSecondary"
                              >
                               neuPrint Server Information 
                              </Typography>
                              <Typography component="p">
                                server: {this.props.neoServer} <br />
                              </Typography>
                              <Typography component="p">
                                available datasets: 
                                        {this.props.availableDatasets.map( (item) => {
                                            return item + " "           
                                        })}
                                <br /> 
                              </Typography>
                              <Typography component="p">
                                last modified: {this.props.lastmod} <br /> 
                              </Typography>
                              <Typography component="p">
                                version: {this.props.version} <br /> 
                              </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid 
                            item 
                            xs={12}
                            sm={6}
                    >
                        <Card className={classes.card2}>
                            <CardContent>
                              <Typography
                                            className={classes.title}
                                            color="textSecondary"
                              >
                                Helpful Hints  
                              </Typography>
                              <Typography component="p">
                                Use the search icon
                                at the <a href="/?openQuery=true">top left</a> to query the database.  Click
                                the <Link to="/help">help</Link> icon
                                for detailed information on the graph model. <br />
                              </Typography>
                                <ul>
                                    <li>Explore high-level region-to-region projectome-level
                                    connectivity as an entry point to analysis with the <a href="/?openQuery=true&Query%5BqueryType%5D=ROI%20Connectivity">ROI Connectivity</a> query.
                                    </li>
                                    <li>Find neurons using region-based filters with the <a href="/?openQuery=true&Query%5BqueryType%5D=Find%20Neurons">Find Neurons</a> query.
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </div>
        );
    }
}

var HomeState = function(state) {
    return {
        neoServer: state.neo4jsettings.neoServer,
        availableDatasets: state.neo4jsettings.availableDatasets,
        lastmod: state.neo4jsettings.lastmod,
        version: state.neo4jsettings.version,
    }
}

Home.propTypes = {
    location: PropTypes.shape({
        search: PropTypes.string.isRequired
    }),
    classes: PropTypes.object,
    availableDatasets: PropTypes.array.isRequired,
    neoServer: PropTypes.string.isRequired, 
    lastmod: PropTypes.string.isRequired, 
    version: PropTypes.string.isRequired, 
}

export default withStyles(styles)(connect(HomeState, null)(Home));
