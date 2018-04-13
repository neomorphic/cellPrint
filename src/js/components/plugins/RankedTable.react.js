/*
 * Implements table view that shows ordered strongest conenction to each neuron
 * and visually indicates the different classes of neurons.  (This is meant
 * to be similar to Lou's tables.)
*/

"use strict"

import React from 'react';
import TextField from 'material-ui/TextField';
import Button from 'material-ui/Button';
import PropTypes from 'prop-types';
var neo4j = require('neo4j-driver').v1;
import { withStyles } from 'material-ui/styles';
import { LoadQueryString, SaveQueryString } from '../../helpers/qsparser';
import Radio, { RadioGroup } from 'material-ui/Radio';
import { FormLabel, FormControl, FormControlLabel } from 'material-ui/Form';
import Typography from 'material-ui/Typography';
import {connect} from 'react-redux';
import NeuronHelp from '../NeuronHelp.react';
import RankCell from '../RankCell.react';


const mainQuery = 'match (m:NeuronYY)-[e:ConnectsTo]-(n:NeuronYY) where ZZ return m.name as Neuron1, n.name as Neuron2, e.weight as Weight, n.bodyId as Body2, m.className as Neuron1Type, n.className as Neuron2Type, id(m) as m_id, id(n) as n_id, id(startNode(e)) as pre_id, m.bodyId as Body1 order by m.bodyId, e.weight desc';

function convert64bit(value) {
    return neo4j.isInt(value) ?
        (neo4j.integer.inSafeRange(value) ? 
            value.toNumber() : value.toString()) 
        : value;
}

var PreOrPostHack = "pre";
var NeuronSrcHack = "";

const styles = () => ({
  textField: {
  },
  formControl: {
  },
});

// available colors

var colorArray = ["#8dd3c7", "#ffffb3", "#bebada", "#fb8072", "#80b1d3",
                    "#fdb462", "#b3de69", "#fccde5", "#d9d9d9", "#bc80bd",
                    "#ccebc5", "#ffed6f"];

/* color blind safe colros
#8e0152
#c51b7d
#de77ae
#f1b6da
#fde0ef
#f7f7f7
#e6f5d0
#b8e186
#7fbc41
#4d9221
#276419

or

#a6cee3
#1f78b4
#b2df8a
#33a02c
*/

class RankedTable extends React.Component {
    static get queryName() {
        return "Ranked Table";
    }
    
    static get queryDescription() {
        return "Show connections to neuron(s) ranked in order and colored by neuron class";
    }
   
    static parseResults(neoResults) {
        // create one comparison table
        var tables = [];
        var headerdata = [];
        var valtable = [];
        var formattable = [];

        // create table info object
        var titlename = ""
        if (PreOrPostHack === "pre") {
            titlename = "Outputs from " + NeuronSrcHack;
        } else {
            titlename = "Inputs to " + NeuronSrcHack;
        }
        tables.push({
            header: headerdata,
            body: valtable,
            formatbody: formattable,
            name: titlename
        });

        // grab type info and reverse mapping information 
        var type2color = {};
        var reversecounts = {};
        neoResults.records.forEach(function (record) {
            var typeinfo = record.get("Neuron2Type");
            if (typeinfo !== null) {
                type2color[typeinfo] = 1;
            }
        
            var preid = convert64bit(record.get("pre_id"));
            var node1id = convert64bit(record.get("m_id"));
            if (((PreOrPostHack === "pre") && (preid !== node1id)) ||
                (PreOrPostHack === "post") && (preid === node1id)) { 
            
                var body1 = convert64bit(record.get("Body1"));
                var body2 = convert64bit(record.get("Body2"));
                var weight = convert64bit(record.get("Weight"));

                if (body2 in reversecounts) {
                    reversecounts[String(body2)][String(body1)] = weight; 
                } else {
                    reversecounts[String(body2)] = {}; 
                    reversecounts[String(body2)][String(body1)] = weight; 
                }
            }
        });
        
        // load colors
        var count = 0;
        for (let type in type2color) {
            type2color[type] = count % colorArray.length;
            count += 1;
        }
        
        // load array of connections for each matching neuron
        var rowstats = [];
        var rowcomps = [];
        var lastbody = -1;
        var maxcols = 0;
        neoResults.records.forEach(function (record) {
            var body1 = convert64bit(record.get("Body1"));
         
            // do not add reverse edges
            var preid = convert64bit(record.get("pre_id"));
            var node1id = convert64bit(record.get("m_id"));
            if (((PreOrPostHack === "pre") && (preid === node1id))
                || ((PreOrPostHack === "post") && (preid !== node1id))) { 
                if (lastbody != body1) {
                    if (lastbody != -1) {
                        valtable.push(rowstats);
                        formattable.push(rowcomps);
                        if (rowstats.length > maxcols) {
                            maxcols = rowstats.length;
                        }
                        rowstats = [];
                        rowcomps = [];
                    }
                    lastbody = body1;
               
                    // set first cell element
                    var neuronmatch1 = record.get("Neuron1");
                    if (neuronmatch1 === null) {
                        neuronmatch1 = body1;
                    }
                    rowstats.push(neuronmatch1);
                    rowcomps.push(<Typography 
                                              variant="body1"
                                              align="center"
                                  >
                                  {neuronmatch1}
                                  </Typography>);
                }

                var neuronmatch2 = record.get("Neuron2");
                if (neuronmatch2 === null) {
                    neuronmatch2 = convert64bit(record.get("Body2"));
                }
                rowstats.push(neuronmatch2);

                // add custom cell element 
                var weight = convert64bit(record.get("Weight"));
                var typeinfo = record.get("Neuron2Type");
                
                var typecolor = "#ffffff";
                if (typeinfo !== null) {
                    typecolor = colorArray[type2color[typeinfo]];
                }
                var body2 = convert64bit(record.get("Body2"));
                var weight2 = 0;
                if ((body2 in reversecounts) && (body1 in reversecounts[body2])) {
                    weight2 = reversecounts[body2][body1];
                }

                rowcomps.push(<RankCell name={neuronmatch2}
                                        weight={weight}
                                        reverse={weight2}
                                        color={typecolor}
                              />);
            }
        });

        if (rowstats.length > 0) {
            if (rowstats.length > maxcols) {
                maxcols = rowstats.length;
            }
            valtable.push(rowstats);
            formattable.push(rowcomps);
        }
            
        // load headers based on max number of columns
        headerdata.push("neuron");
        for (let i = 1; i < maxcols; i++) {
            headerdata.push("#" + String(i));
        }

        return tables;
    }

    constructor(props) {
        super(props);
        var initqsParams = {
            neuronsrc: "",
            preorpost: "pre",
        }
        var qsParams = LoadQueryString("Query:" + this.constructor.queryName, initqsParams, this.props.urlQueryString);
        this.state = {
            qsParams: qsParams
        };
    }

    processRequest = () => {
        if (this.state.qsParams.neuronsrc !== "") {
            var neoquery = "";
            if (isNaN(this.state.qsParams.neuronsrc)) {
                neoquery = mainQuery.replace("ZZ", 'm.name =~"' + this.state.qsParams.neuronsrc + '"');
            } else {
                neoquery = mainQuery.replace("ZZ", 'm.bodyId =' + this.state.qsParams.neuronsrc);
            }
            neoquery = neoquery.replace(/YY/g, this.props.datasetstr)
            PreOrPostHack = this.state.qsParams.preorpost;
            NeuronSrcHack = this.state.qsParams.neuronsrc;
            this.props.callback(neoquery);
        }
    }

    addNeuron = (event) => {
        var oldparams = this.state.qsParams;
        oldparams.neuronsrc = event.target.value;
        this.props.setURLQs(SaveQueryString("Query:" + this.constructor.queryName, oldparams));
        this.setState({qsParams: oldparams});
    }

    setDirection = (event) => {
        var oldparams = this.state.qsParams;
        oldparams.preorpost = event.target.value;
        this.props.setURLQs(SaveQueryString("Query:" + this.constructor.queryName, oldparams));
        this.setState({qsParams: oldparams});
    }

    render() {
        const { classes } = this.props;
        return (<div> 
                    <FormControl className={classes.formControl}>
                        <NeuronHelp>
                        <TextField 
                            label="Neuron name"
                            multiline
                            rows={1}
                            value={this.state.qsParams.neuronsrc}
                            rowsMax={4}
                            className={classes.textField}
                            onChange={this.addNeuron}
                        />
                        </NeuronHelp>
                    </FormControl>
                    <FormControl
                                component="fieldset"
                                required
                                className={classes.formControl}
                    >
                        <FormLabel component="legend">Neuron Direction</FormLabel>
                        <RadioGroup
                                    aria-label="preorpost"
                                    name="preorpost"
                                    className={classes.group}
                                    value={this.state.qsParams.preorpost}
                                    onChange={this.setDirection}
                        >
                            <FormControlLabel 
                                                value="pre"
                                                control={<Radio />}
                                                label="Pre-synaptic"
                            />
                            <FormControlLabel
                                                value="post"
                                                control={<Radio />}
                                                label="Post-synaptic"
                            />
                        </RadioGroup>
                    </FormControl> 
                    <Button
                        variant="raised"
                        onClick={this.processRequest}
                    >
                        Submit
                    </Button>
            </div>
        );
    }
}

RankedTable.propTypes = {
    callback: PropTypes.func.isRequired,
    disable: PropTypes.bool,
    setURLQs: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
    datasetstr: PropTypes.string.isRequired,
    urlQueryString: PropTypes.string.isRequired,
};

var RankedTableState = function(state){
    return {
        urlQueryString: state.app.urlQueryString,
    }   
};

var RankedTableDispatch = function(dispatch) {
    return {
        setURLQs: function(querystring) {
            dispatch({
                type: 'SET_URL_QS',
                urlQueryString: querystring
            });
        }
    }
}


export default withStyles(styles)(connect(RankedTableState, RankedTableDispatch)(RankedTable));