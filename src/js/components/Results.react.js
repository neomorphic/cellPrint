/*
 * Main page to hold results from query.  This could be
 * a simple table or a table of tables.
*/

"use strict";

import React from 'react';
import Typography from 'material-ui/Typography';
import Fade from 'material-ui/transitions/Fade';
import { CircularProgress } from 'material-ui/Progress';
import { connect } from 'react-redux';
import { withStyles } from 'material-ui/styles';
import _ from "underscore";
import PropTypes from 'prop-types';
import ResultsTopBar from './ResultsTopBar.react';
import SimpleTables from './SimpleTables.react';
import Skeleton from './Skeleton.react';
import { Responsive, WidthProvider } from 'react-grid-layout';
const ResponsiveGridLayout = WidthProvider(Responsive);

var LightColors = [
    "#d9d9d9",
    "#8dd3c7",
    "#ffffb3",
    "#bebada",
    "#fb8072",
    "#80b1d3",
    "#fdb462",
    "#b3de69",
    "#fccde5",
];

const styles = () => ({
    root: {
        flexGrow: 1,
    },
    flex: {
        flex: 1,
    },
    tablesDiv: {
        height: "80%",
    },
});

class Results extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            currLayout: null,
        };
    }
  
    // if only query string has updated, prevent re-render
    shouldComponentUpdate(nextProps, nextState) {
        nextProps.location["search"] = this.props.location["search"];
        return (!_.isEqual(nextProps, this.props) || !_.isEqual(nextState, this.state));
    }

    changeLayout = (layout) => {
        let currIndex = 0;
        let tempLayout = {}
        this.props.allTables.map( (result, index) => {
            if (!this.props.clearIndices.has(index)) {
                if ((this.props.allTables.length-this.props.clearIndices.size) > 1) {
                    tempLayout[(result[0].uniqueId)*2] = layout[currIndex];
                } else {
                    tempLayout[(result[0].uniqueId)*2+1] = layout[currIndex];
                }
                currIndex++;
            }
        });
        
        this.setState({currLayout: tempLayout});
    }
  
    downloadFile = (index) => {
        if (("isSkeleton" in this.props.allTables[index][0]) && 
                (this.props.allTables[index][0].isSkeleton)) {
            let swcdata = "";
            let swc = this.props.allTables[index][0].swc;
            let ids = Object.keys(swc);
            ids.sort(function(a, b) {
                return parseInt(a) - parseInt(b);
            });
            for (let i = 0; i < ids.length; i++) {
                let row = swc[ids[i]];
                let currid = ids[i];
                swcdata += (currid + " ");
                swcdata += (row.type.toString() + " ");
                swcdata += (row.x.toString() + " ");
                swcdata += (row.y.toString() + " ");
                swcdata += (row.z.toString() + " ");
                swcdata += (row.radius.toString() + " ");
                swcdata += (row.parent.toString() + "\n");
            }
            
            let element = document.createElement("a");
            let file = new Blob([swcdata], {type: 'text/plain'});
            element.href = URL.createObjectURL(file);
            element.download = this.props.allTables[index][0].name + ".swc";
            element.click();
        } else {
            let csvdata = "";
            this.props.allTables[index].map( (tableinfo) => {
                // load one table -- fixed width
                
                // load table name
                var numelements = tableinfo.header.length;
                csvdata = csvdata + tableinfo.name + ",";
                for (var i = 1; i < numelements; i++) {
                    csvdata = csvdata + ",";
                }
                csvdata = csvdata + "\n";

                // load headers
                tableinfo.header.map( (headinfo) => {
                    csvdata = csvdata + headinfo.getValue() + ",";
                });
                csvdata = csvdata + "\n";

                // load data
                tableinfo.body.map( (rowinfo) => {
                    rowinfo.map( (elinfo) => {
                        csvdata = csvdata + elinfo.getValue() + ",";
                    });
                    csvdata = csvdata + "\n";
                });
            });

            let element = document.createElement("a");
            let file = new Blob([csvdata], {type: 'text/csv'});
            element.href = URL.createObjectURL(file);
            element.download = "results.csv";
            element.click();
        }
    }

    render() {
        // TODO: show query runtime results
        const { classes } = this.props; 
        let resArray = [];
        let currIndex = 0;

        if ((this.props.neoError === null) && (this.props.allTables !== null)) {
            this.props.allTables.map( (result, index) => {
                if (!this.props.clearIndices.has(index)) {
                    let unId = ((this.props.allTables.length-this.props.clearIndices.size) > 1) ? result[0].uniqueId*2 : (result[0].uniqueId*2+1);
                    resArray.push((
                        <div 
                            key={unId} 
                            data-grid={{
                                x: (currIndex*6)%12,
                                    y: Math.floor(currIndex/2)*18,
                                    w: ((this.props.allTables.length-this.props.clearIndices.size) > 1) ? 6 : 12,
                                    h: 20
                            }}
                        >
                            <ResultsTopBar
                                        downloadCallback={this.downloadFile}
                                        name={(result.length == 1) ? 
                                            result[0].name :
                                            String(result.length) + " tables"
                                        } 
                                        queryStr={result[0].queryStr}
                                        index={index}
                                        color={LightColors[index%LightColors.length]}
                            />
                            <div className={classes.tablesDiv}>
                                {(("isSkeleton" in result[0]) && (result[0].isSkeleton)) ?
                                    (
                                    <Skeleton 
                                                swc={result[0].swc}
                                                uniqueId={result[0].uniqueId}
                                                layout={((this.state.currLayout !== null) && (unId in this.state.currLayout)) ? this.state.currLayout[unId] : { 
                                                                x: ((currIndex*6)%12),
                                                                y: (Math.floor(currIndex/2)*18),
                                                                w: (((this.props.allTables.length-this.props.clearIndices.size) > 1) ? 6 : 12), 
                                                                h: 20
                                                           }
                                                }
                                    />
                                    ): 
                                    ( 
                                    <SimpleTables 
                                                    allTables={result}
                                    />
                                    )
                                }
                            </div>
                        
                        </div>
                    ));
                    currIndex += 1;
                }
            });
        }

        return (
            <div>
                { (this.props.userInfo !== null && this.props.allTables !== null) ? (
                    <div />    
                ) : (
                    <Typography variant="title">No Query Results</Typography>
                  )
                }
                <Fade
                    in={this.props.isQuerying}
                    style={{
                        transitionDelay: this.props.isQuerying ? '800ms' : '0ms',
                    }}
                    unmountOnExit
                >
                    <CircularProgress />
                </Fade>
                { (this.props.neoError !== null) ? 
                    (<Typography>Error: {this.props.neoError.code}</Typography>) :
                    (resArray.length > 0 ?
                        (
                            <ResponsiveGridLayout 
                                                    className="layout" 
                                                    rowHeight={30} 
                                                    breakpoints={{lg: 2000}}
                                                    cols={{lg: 12}}
                                                    draggableHandle=".topresultbar"
                                                    compactType="vertical"
                                                    onResizeStop={this.changeLayout}
                            >
                                {resArray.map( (result) => {
                                    return result;
                                })}
                            </ResponsiveGridLayout>
                        ) : 
                        (<div />)
                    )
                }
            </div>
        );
    }
}

Results.propTypes = {
    location: PropTypes.shape({
        search: PropTypes.string.isRequired
    }),
    allTables: PropTypes.array,
    clearIndices: PropTypes.object,
    numClear: PropTypes.number,
    queryObj: PropTypes.object.isRequired, 
    neoError: PropTypes.object,
    isQuerying: PropTypes.bool.isRequired,
    classes: PropTypes.object.isRequired,
    userInfo: PropTypes.object,
};

// result data [{name: "table name", header: [headers...], body: [rows...]
var ResultsState = function(state){
    return {
        isQuerying: state.query.isQuerying,
        neoError: state.query.neoError,
        allTables: state.results.allTables,
        clearIndices: state.results.clearIndices,
        numClear: state.results.numClear,
        userInfo: state.user.userInfo,
        queryObj: state.query.neoQueryObj,
    }   
};

export default withStyles(styles)(connect(ResultsState, null)(Results));
