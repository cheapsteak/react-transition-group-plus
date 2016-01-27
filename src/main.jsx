import React from 'react';

import { render, findDOMNode } from 'react-dom';
import ReactTransitionGroup from 'react-addons-transition-group';
import ReactTransitionGroupPlus from './ReactTransitionGroupPlus.js';
import animate from 'gsap-promise';

class Animates extends React.Component {

  static animationStates = {
    beforeEnter: { opacity: 0, y: 100 },
    afterEnter: { opacity: 1, y: 0 },
    beforeLeave: { opacity: 1, y: 0 },
    afterLeave: { opacity: 0, y: 100}
  };

  componentDidMount() {
    animate.set(findDOMNode(this), Animates.animationStates.beforeEnter);
  }

  componentWillAppear(callback) {
    animate.set(findDOMNode(this), Animates.animationStates.afterEnter);
    callback();
  }

  componentWillEnter(callback) {
    animate.to(findDOMNode(this), 0.5, Animates.animationStates.afterEnter).then(callback);
  }

  componentWillLeave(callback) {
    animate.to(findDOMNode(this), 0.5, Animates.animationStates.afterLeave).then(callback);
  }

  render() {
    return <div className={`animates ${this.props.className}`}>{this.props.text}</div>;
  }

}

class App extends React.Component {
  state = {
    counter: 0,
    transitionMode: 'out-in'
  };

  handleClick = () => {
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
          this.state.counter % 2 === 0
          ? <Animates key={1} className="blue" text="123123"/>
          : <Animates key={2} className="red" text="asdf"/>
        }
      </ReactTransitionGroupPlus>
    </div>;
  }
}

render(<App/>, document.getElementById('container'));