import React, { Component, PropTypes } from 'react';
import { MODE_NAMES, MODES } from '../reducers/microcontrollerEnums';
// import { intersection, range, propOr, ifElse } from 'ramda';
import { intersection, propOr } from 'ramda';
import styles from './Pin.sass'; // eslint-disable-line no-unused-vars
import rd3 from 'rd3';

export default class Pin extends Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    tags: PropTypes.array.isRequired,
    pin: PropTypes.object.isRequired,
    changeMode: PropTypes.func.isRequired,
    setEnabled: PropTypes.func.isRequired,
    listen: PropTypes.func.isRequired,
    digitalWrite: PropTypes.func.isRequired,
    analogWrite: PropTypes.func.isRequired,
  };

  render() {
    const {
      changeMode,
      setEnabled,
      listen,
      digitalWrite,
      analogWrite,
      pin,
      name,
      tags
    } = this.props;
    const { id, mode, report, values } = pin;

    const supportedModes = intersection(
      pin.supportedModes,
      Object.keys(MODE_NAMES).map(k => parseInt(k, 10))
    );
    const getModeDescriptionForModeNumber = (num) => propOr('Not Set', num, MODE_NAMES);

    const data = [
      {
        name: 'series1',
        values,
      },
    ];


    const AreaChart = rd3.AreaChart;
    const chart = values.length === 0 ? <p>No data</p> : (
      <AreaChart
        data={data}
        width="100%"
        height={200}
        viewBoxObject={{
          x: 0,
          y: 0,
          width: 500,
          height: 200
        }}
        title="Line Chart"
        yAxisLabel="Value (%)"
        xAxisTickValues={[]}
        xAxisLabel="Elapsed Time"
        domain={{ y: [0, 100] }}
        gridHorizontal
      />
    );

    const modeSelector = (
      <select
        defaultValue="{defaultMode}"
        onChange={event => changeMode(id, event.target.value)}
        disabled={supportedModes.length === 0}
      >
        {supportedModes.map((supportedMode) => (
          <option key={supportedMode} value={supportedMode}>
            {getModeDescriptionForModeNumber(supportedMode)}
          </option>
          )
        )}
      </select>
    );

    const pinClass = pin.isAnalogPin ? 'pin pin--analog' : 'pin pin--digital';

    const pinControls = () => {
      switch (mode) {
        case MODES.INPUT:
        case MODES.ANALOG:
          return (
            <div>
              <span className="btn--blue btn--s px1 mx1" onClick={() => listen(id, mode, name)}>
                Listen
              </span>
              {chart}
            </div>
          );
        case MODES.OUTPUT:
          return (
            <div>
              <button
                className="button-submit"
                onClick={() => digitalWrite(id, 1)}
              >On</button>
              <button
                className="button-submit"
                onClick={() => digitalWrite(id, 0)}
              >Off</button>
            </div>
          );
        case MODES.PWM:
          return (
            <div>
              PWM:
              <input
                type="range"
                name="pwm"
                min="0" max="255"
                defaultValue="0"
                onChange={(e) => analogWrite(id, e.target.value)}
              />
            </div>
          );
        default:
          return <div></div>;
      }
    };

    return (
      <div className={pinClass}>
        <div className="pin__header">
          <h2 className="pin__name">{name}</h2>
          {tags.map((tag) =>
            <div key={tag} className="pin__tag">{tag}</div>
          )}
        </div>
        <div className="pin__body">
          Reporting: {report},
          {modeSelector}
          {pinControls(mode)}
        </div>
        <div className="pin__footer">
          <input
            type="checkbox"
            name="Enabled"
            checked={pin.enabled}
            onChange={(e) => setEnabled(pin.id, e.target.checked)}
          />
          Enabled
        </div>
      </div>
    );
  }
}
