import React from 'react';

import { render, findDOMNode } from 'react-dom';
import ReactTransitionGroup from 'react-addons-transition-group';
import ReactTransitionGroupPlus from '../ReactTransitionGroupPlus.js';
import animate from 'gsap-promise';
import RadioGroup from 'react-radio-group';

import reactMixin from 'react-mixin';
import LinkedStateMixin from 'react-addons-linked-state-mixin';

import _ from 'lodash';

import Animates from './animates/animates.jsx';

const colors = [
  'blue',
  'red',
  'green',
  'orange',
  'purple',
];

@reactMixin.decorate(LinkedStateMixin)
class App extends React.Component {
  state = {
    counter: 0,
    transitionMode: 'simultaneous',
    transitionGroupComponent: ReactTransitionGroupPlus,
    enterDuration: 0.8,
    leaveDuration: 0.3,
  };

  handleClick = () => {
    this.setState({counter: this.state.counter + 1});
  };

  handleTransitionModeChange = (e) => {
    this.setState({transitionMode: e.target.value});
  };

  handleTransitionGroupComponentChange = (componentName) => {
    this.setState({
      transitionGroupComponent: componentName === 'ReactTransitionGroupPlus'
        ? ReactTransitionGroupPlus
        : ReactTransitionGroup
    });
  };

  render() {
    const color = colors[this.state.counter % 5];

    const TransitionGroup = this.state.transitionGroupComponent;
    const selectedTransitionGroupComponentName = this.state.transitionGroupComponent === ReactTransitionGroupPlus
      ? 'ReactTransitionGroupPlus'
      : 'ReactTransitionGroup';

    const transitionModeRadioGroup = TransitionGroup === ReactTransitionGroupPlus && <RadioGroup
        name="transitionMode"
        selectedValue={this.state.transitionMode}
        onChange={ transitionMode => this.setState({transitionMode}) }
        >
        {Radio => (
          <div className="radiogroup transition-mode">
            <legend>Transition Mode</legend>
            <label><Radio value="simultaneous" /> simultaneous </label>
            <label><Radio value="out-in" /> out-in </label>
            <label><Radio value="in-out" /> in-out </label>
          </div>
        )}
      </RadioGroup>;

    return <div className="demo">
      <div className="control-panel">
        <h1>Transition<br/>Group<br/>Plus<br/><small>demo</small></h1>
        <RadioGroup
          name="transitionGroupComponent"
          selectedValue={selectedTransitionGroupComponentName}
          onChange={this.handleTransitionGroupComponentChange}
          >
          {Radio => (
            <div className="radiogroup transition-group-component">
              <label><Radio value="ReactTransitionGroupPlus" /> TransitionGroupPlus</label>
              <label><Radio value="ReactTransitionGroup" /> ReactTransitionGroup</label>
            </div>
          )}
        </RadioGroup>
        {transitionModeRadioGroup}
        <label>
          <span>Enter Duration: {this.state.enterDuration}</span>
          <input type="range" valueLink={this.linkState('enterDuration')} min="0" max="2" step="0.1"/>
        </label>
        <label>
          <span>Leave Duration: {this.state.leaveDuration}</span>
          <input type="range" valueLink={this.linkState('leaveDuration')} min="0" max="2" step="0.1"/>
        </label>
        <button className="cta-button" onClick={this.handleClick}>
          Animate!
        </button>

        <div className="badges">
          <a href="https://github.com/cheapsteak/react-transition-group-plus/blob/master">
            <img alt="npm" src="https://img.shields.io/npm/v/react-transition-group-plus.svg"/>
          </a>
          <iframe
            className="github-btn"
            src="https://ghbtns.com/github-btn.html?user=cheapsteak&repo=react-transition-group-plus&type=star"
            frameBorder="0" scrolling="0" width="170px" height="20px"
            >
          </iframe>
        </div>
      </div>

        <TransitionGroup
          transitionMode={this.state.transitionMode}
          component="div"
          className="output-panel"
          onClick={this.handleClick}
          >
          <Animates
            key={this.state.counter}
            className={color}
            enterDuration={this.state.enterDuration}
            leaveDuration={this.state.leaveDuration}
          />
        </TransitionGroup>

    </div>;
  }
}

render(<App/>, document.getElementById('container'));