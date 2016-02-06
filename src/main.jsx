import React from 'react';

import { render, findDOMNode } from 'react-dom';
import ReactTransitionGroup from 'react-addons-transition-group';
import ReactTransitionGroupPlus from './ReactTransitionGroupPlus.js';
import animate from 'gsap-promise';
import RadioGroup from 'react-radio-group';

import _ from 'lodash';

const enterDuration = 0.5;
const leaveDuration = 0.5;

function getColorByKey (key) {
  return 'color: ' + {
    'red': '#aa3333',
    'blue': '#3333ff',
    'green': '#33aa33',
    'orange': '#ffa500',
    'purple': '#800080',
  }[key];
}

const animationStates = {
  beforeEnter: { opacity: 0, y: 100 },
  idle: { opacity: 1, y: 0 },
  afterLeave: { opacity: 0, y: -50},
};

class Animates extends React.Component {

  static animationStates = animationStates;

  componentDidMount() {
    const el = findDOMNode(this);

    console.log('did mount');

    this.timeline = new TimelineMax()
      .pause()
      .add(TweenMax.to(el, 1, Animates.animationStates.beforeEnter))
      .add('beforeEnter')
      .add(TweenMax.to(el, 1, Animates.animationStates.idle))
      .add('idle')
      .add(TweenMax.to(el, 1, Animates.animationStates.afterLeave))
      .add('afterLeave')

    this.timeline.seek('beforeEnter');
  }

  componentWillAppear(callback) {
    console.log('will appear');
    this.timeline.seek('idle');
    callback();
  }

  componentWillEnter(callback) {
    const el = findDOMNode(this);

    this.timeline
      .seek('beforeEnter');
    TweenMax.killTweensOf(this.timeline);
    TweenMax.set(el, {zIndex: this.props.key});
    TweenMax.to(this.timeline, 1, { time: this.timeline.getLabelTime('idle'), onComplete: callback });
  }

  componentWillLeave(callback) {
    const className = this.props.className;
    this.timeline.pause();
    TweenMax.killTweensOf(this.timeline);
    TweenMax.to(this.timeline, 1, { time: this.timeline.getLabelTime('afterLeave'), onComplete: callback });
  }

  render() {
    return <div className={`animates ${this.props.className}`}></div>;
  }

}

class App extends React.Component {
  state = {
    counter: 0,
    transitionMode: 'out-in',
    transitionGroupComponent: ReactTransitionGroupPlus
  };

  handleClick = () => {
    console.log('------------- click -----------');
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
      <button onClick={this.handleClick}>
        Click Me
      </button>
      <TransitionGroup transitionMode={this.state.transitionMode}>
        <Animates key={this.state.counter} className={color}/>
      </TransitionGroup>
    </div>;
  }
}

render(<App/>, document.getElementById('container'));