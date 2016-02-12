import React from 'react';

import { render, findDOMNode } from 'react-dom';
import ReactTransitionGroup from 'react-addons-transition-group';
import ReactTransitionGroupPlus from './ReactTransitionGroupPlus.js';
import animate from 'gsap-promise';
import RadioGroup from 'react-radio-group';

import reactMixin from 'react-mixin';
import LinkedStateMixin from 'react-addons-linked-state-mixin';

import _ from 'lodash';

const enterDuration = 0.5;
const leaveDuration = 0.5;

const animationStates = {
  beforeEnter: { y: 100, scale: 1.1, opacity: 0 },
  idle: { y: 0, scale: 1, opacity: 1 },
  afterLeave: { y: -50, scale: 0.9, opacity: 0 },
};

class Animates extends React.Component {

  static animationStates = animationStates;

  componentDidMount() {
    const el = findDOMNode(this);

    this.timeline = new TimelineMax()
      .pause()
      .add(TweenMax.to(el, 1, _.extend({}, Animates.animationStates.beforeEnter, {ease: Linear.easeNone})))
      .add('beforeEnter')
      .add(TweenMax.to(el, 1, _.extend({}, Animates.animationStates.idle, {ease: Linear.easeNone})))
      .add('idle')
      .add(TweenMax.to(el, 1, _.extend({}, Animates.animationStates.afterLeave, {ease: Linear.easeNone})))
      .add('afterLeave')

    this.timeline.seek('beforeEnter');
  }

  componentWillAppear(callback) {
    this.timeline.seek('idle');
    callback();
  }

  componentWillEnter(callback) {
    const el = findDOMNode(this);

    this.timeline
      .seek('beforeEnter');
    TweenMax.killTweensOf(this.timeline);
    TweenMax.to(this.timeline, this.props.enterDuration, { time: this.timeline.getLabelTime('idle'), onComplete: callback, ease: Sine.easeOut });
  }

  componentWillLeave(callback) {
    const className = this.props.className;
    this.timeline.pause();
    TweenMax.killTweensOf(this.timeline);
    TweenMax.to(this.timeline, this.props.leaveDuration, { time: this.timeline.getLabelTime('afterLeave'), onComplete: callback, ease: Sine.easeIn });
  }

  render() {
    return <div className={`animates ${this.props.className}`}></div>;
  }

}

@reactMixin.decorate(LinkedStateMixin)
class App extends React.Component {
  state = {
    counter: 0,
    transitionMode: 'out-in',
    transitionGroupComponent: ReactTransitionGroupPlus,
    enterDuration: 0.3,
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
    const color = [
      'blue',
      'red',
      'green',
      'orange',
      'purple',
    ][this.state.counter % 5];

    const TransitionGroup = this.state.transitionGroupComponent;
    const selectedTransitionGroupComponentName = this.state.transitionGroupComponent === ReactTransitionGroupPlus
      ? 'ReactTransitionGroupPlus'
      : 'ReactTransitionGroup';

    return <div>
      <RadioGroup name="transitionGroupComponent" selectedValue={selectedTransitionGroupComponentName} onChange={this.handleTransitionGroupComponentChange}>
        {Radio => (
          <div>
            <label><Radio value="ReactTransitionGroupPlus" /> ReactTransitionGroupPlus</label>
            <label><Radio value="ReactTransitionGroup" /> ReactTransitionGroup</label>
          </div>
        )}
      </RadioGroup>
      { TransitionGroup === ReactTransitionGroupPlus &&
        <select value={this.state.transitionMode} onChange={this.handleTransitionModeChange}>
          <option value="out-in">Out then In</option>
          <option value="in-out">In then Out</option>
          <option value="simultaneous">Simultaneous</option>
        </select>
      }
      <br/>
      <label>
        Enter Duration: {this.state.enterDuration}
        <br />
        <input type="range" valueLink={this.linkState('enterDuration')} min="0" max="2" step="0.1"/>
        <br />
        Leave Duration: {this.state.leaveDuration}
        <br />
        <input type="range" valueLink={this.linkState('leaveDuration')} min="0" max="2" step="0.1"/>
      </label>
      <br/>
      <button onClick={this.handleClick}>
        Click Me
      </button>
      <TransitionGroup transitionMode={this.state.transitionMode}>
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