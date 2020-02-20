import React from 'react';
import PropTypes from 'prop-types';
import Immutable from 'immutable';

import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Button from '@material-ui/core/Button';

import ColorPickerModal from './ColorPickerModal';

export default function SynapseUpdater(props) {
  const { synapse, isInput, actions, synapseState, bodyId, dataSet, synapseRadius } = props;
  const [id, synapseMeta] = synapse;

  const synapseType = isInput ? 'inputs' : 'outputs';
  const synapseStateCheck = isInput
    ? synapseState.getIn([bodyId, synapseType], Immutable.Map({}))
    : synapseState.getIn([bodyId, synapseType], Immutable.Map({}));

  const visible = synapseStateCheck.get(id, false) ? {} : { color: '#ccc' };

  function handleToggle() {
    // decide if this input/output
    if (synapseState.getIn([bodyId, synapseType, id])) {
      actions.removeSynapse(bodyId, id, isInput);
    } else {
      actions.loadSynapse(bodyId, id, dataSet, { isInput, radius: synapseRadius });
    }
  }

  function handleChangeColor(unusedId, color) {
    if (!synapseState.getIn([bodyId, synapseType, id])) {
      actions.loadSynapse(bodyId, id, dataSet, { isInput, radius: synapseRadius, color });
    } else {
      actions.updateSynapseColor(bodyId, id, { isInput, color });
    }
  }

  return (
    <ListItem key={id}>
      <ListItemText>
        <Button onClick={handleToggle} style={visible}>
          {id}({synapseMeta.type}) {synapseMeta.weight}{' '}
        </Button>
      </ListItemText>
      <ColorPickerModal
        bodyId={id}
        currentColor={synapseState.getIn([bodyId, synapseType, id, 'color'])}
        handleChangeColor={handleChangeColor}
      />
    </ListItem>
  );
}

SynapseUpdater.propTypes = {
  synapse: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.object])).isRequired,
  isInput: PropTypes.bool,
  actions: PropTypes.object.isRequired,
  bodyId: PropTypes.string.isRequired,
  dataSet: PropTypes.string.isRequired,
  synapseState: PropTypes.object.isRequired,
  synapseRadius: PropTypes.number.isRequired
};

SynapseUpdater.defaultProps = {
  isInput: false
};
