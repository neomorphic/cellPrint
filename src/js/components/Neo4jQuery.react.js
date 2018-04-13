/* 
 * Non visual class to handle neo4j queries.
*/

"use strict"

import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

var neo4j = require('neo4j-driver').v1;

class Neo4jQuery extends React.Component {
    componentWillReceiveProps(nextProps) {
        // update session if necessary
        var driver = this.props.neoDriver;
        if (nextProps.neoServer !== this.props.neoServer) {
            if (this.props.neoDriver !== null) {
                this.props.neoDriver.close(); 
            }
            if (nextProps.neoServer !== "") {
                driver = neo4j.driver("bolt://" + nextProps.neoServer, neo4j.auth.basic("neo4j", "n304j"));
                this.props.setDriver(driver)
            }
        }

        // start query if query state changed
        if (nextProps.isQuerying) {
            if (nextProps.neoQuery !== "" && nextProps.neoServer !== "") {
                // run query (TODO: handle blocking query??) 
                var session = driver.session();
                var setError = this.props.setQueryError;
                var saveResults = this.props.saveResults;
                session
                    .run(nextProps.neoQuery)
                    .then(function (result) {
                        saveResults(result);
                        session.close();
                    })
                    .catch(function (error) {
                        setError(error);
                    });
            }
        }
    }
    
    render() {
        return <div />
    }
}

var Neo4jQueryState = function(state){
    return {
        neoQuery: state.query.neoQuery,
        isQuerying: state.query.isQuerying,
        neoServer: state.neo4jsettings.neoServer,
        neoDriver: state.neo4jsettings.neoDriver,
    }   
};

var Neo4jQueryDispatch = function(dispatch) {
    return {
        saveResults: function(res) {
            dispatch({
                type: 'SET_NEO_RESULTS',
                neoResults: res
            });
        },
        setDriver: function(driver) {
            dispatch({
                type: 'SET_NEO_DRIVER',
                neoDriver: driver
            });
        },
        setQueryError: function(error) {
            dispatch({
                type: 'SET_NEO_ERROR',
                neoError: error
            });
        }
    }
}

Neo4jQuery.propTypes = {
    neoDriver: PropTypes.object,
    neoServer: PropTypes.string.isRequired,
    neoQuery: PropTypes.string.isRequired,
    isQuerying: PropTypes.bool.isRequired,
    setDriver: PropTypes.func.isRequired,
    setQueryError: PropTypes.func.isRequired,
    saveResults: PropTypes.func.isRequired,
};

export default connect(Neo4jQueryState, Neo4jQueryDispatch)(Neo4jQuery);
