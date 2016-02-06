import React from 'react';

import { render, findDOMNode } from 'react-dom';
import ReactTransitionGroup from 'react-addons-transition-group';
import ReactTransitionGroupPlus from './ReactTransitionGroupPlus.js';
import animate from 'gsap-promise';

const enterDuration = 1;
const leaveDuration = 1;

class Animates extends React.Component {

  i = 0;

  static animationStates = {
    beforeEnter: { opacity: 0, y: 100 },
    afterEnter: { opacity: 1, y: 0 },
    beforeLeave: { opacity: 1, y: 0 },
    afterLeave: { opacity: 0, y: -50}
  };

  componentDidMount() {
    animate.set(findDOMNode(this), Animates.animationStates.beforeEnter);
  }

  componentWillAppear(callback) {
    animate.set(findDOMNode(this), Animates.animationStates.afterEnter);
    callback();
  }

  componentWillEnter(callback) {
    console.log('willenter: ', this.props.className);
    animate.to(findDOMNode(this), enterDuration, Animates.animationStates.afterEnter).then(callback);
  }

  componentWillLeave(callback) {
    animate.to(findDOMNode(this), leaveDuration, Animates.animationStates.afterLeave).then(callback);
  }

  // componentCancelledEnter() {
  //   console.log('cancelled enter', this.props.className);
  //   TweenMax.killTweensOf(findDOMNode(this));
  // }

  // componentCancelledLeave() {
  //   console.log('cancelled leave', this.props.className);
  //   TweenMax.killTweensOf(findDOMNode(this));
  // }

  render() {
    return <div className={`animates ${this.props.className}`}>{this.props.className}</div>;
  }

}

class App extends React.Component {
  state = {
    counter: 0,
    transitionMode: 'out-in'
  };

  handleClick = () => {
    console.log('------------- click -----------');
    this.setState({counter: this.state.counter + 1});
  };

  handleTransitionModeChange = (e) => {
    this.setState({transitionMode: e.target.value});
  };

  render() {
    return <div>
      <select value={this.state.transitionMode} onChange={this.handleTransitionModeChange}>
        <option value="out-in">Out then In</option>
        <option value="in-out">In then Out</option>
        <option value="simultaneous">Simultaneous</option>
      </select>
      <button onClick={this.handleClick}>
        Click Me
      </button>
      <ReactTransitionGroupPlus transitionMode={this.state.transitionMode}>
        {
          [
            <Animates key={'blue'} className="blue"/>,
            <Animates key={'red'} className="red"/>,
            <Animates key={'green'} className="green"/>,
            <Animates key={'orange'} className="orange"/>,
            <Animates key={'purple'} className="purple"/>,
          ][this.state.counter % 3]
        }
      </ReactTransitionGroupPlus>
    </div>;
  }
}

render(<App/>, document.getElementById('container'));