/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactTransitionGroup
 */

'use strict';

var React = require('react');
var _ = require('lodash');
var ReactTransitionChildMapping = require('react/lib/ReactTransitionChildMapping');

var assign = require('react/lib/Object.assign');

window.iii = 0;

function getColorByKey (key) {
  return 'color: ' + {
    '.$red': '#aa3333',
    '.$blue': '#3333ff',
  }[key];
}

var ReactTransitionGroupPlus = React.createClass({
  displayName: 'ReactTransitionGroupPlus',

  propTypes: {
    component: React.PropTypes.any,
    childFactory: React.PropTypes.func,
    transitionMode: React.PropTypes.string,
  },

  getDefaultProps: function() {
    return {
      component: 'span',
      childFactory: function (arg) {
        return arg;
      },
      transitionMode: 'simultaneous',
    };
  },

  getInitialState: function() {
    return {
      children: ReactTransitionChildMapping.getChildMapping(this.props.children),
    };
  },

  componentWillMount: function() {
    window.ttt = this;
    // previously currently visible
    // don't want to performLeave on keys that never entered
    this.currentlyEnteringOrEnteredKeys = {};
    // don't want to performEnter on keys that never left
    this.currentlyLeavingKeys = {};
    this.keysToEnter = [];
    this.keysToLeave = [];
    this.cancel = null;
    this.pendingCallback = null;
  },

  componentDidMount: function() {
    var initialChildMapping = this.state.children;
    for (var key in initialChildMapping) {
      if (initialChildMapping[key]) {
        this.performAppear(key);
      }
    }
  },

  componentWillReceiveProps: function(nextProps) {
    var nextChildMapping = ReactTransitionChildMapping.getChildMapping(
      nextProps.children
    );
    var prevChildMapping = this.state.children;

    this.setState({
      children: ReactTransitionChildMapping.mergeChildMappings(
        prevChildMapping,
        nextChildMapping
      ),
    });

    var key;

    for (key in nextChildMapping) {
      var hasPrev = prevChildMapping && prevChildMapping.hasOwnProperty(key);
      if (nextChildMapping[key] && (!hasPrev || (this.props.transitionMode === 'in-out' && this.currentlyLeavingKeys[key]))) {
        this.keysToEnter.push(key);
      }
    }

    for (key in prevChildMapping) {
      var hasNext = nextChildMapping && nextChildMapping.hasOwnProperty(key);
      if (prevChildMapping[key] && !hasNext ) {
        console.log('%c pushing to leave keys' + key, getColorByKey(key));
        this.keysToLeave.push(key);
      }
    }

    // If we want to someday check for reordering, we could do it here.
  },

  componentDidUpdate: function() {
    var keysToEnter = this.keysToEnter;
    var keysToLeave = this.keysToLeave;


    // console.log({keysToEnter, keysToLeave, refs: JSON.stringify(Object.keys(this.refs))});

    switch (this.props.transitionMode) {
      case 'out-in':
        var keysToLeave = this.keysToLeave;
        var keysToEnter = _.difference(keysToEnter, keysToLeave);

        console.log('keysToLeave', keysToLeave, 'keysToEnter', keysToEnter);
        this.keysToLeave = [];
        if (keysToLeave.length) {
          keysToLeave.forEach(this.performLeave)
        } else {
          console.log('!!!!!!! entering:' + keysToEnter);
          this.keysToEnter = [];
          keysToEnter.forEach(this.performEnter)
        }
        break;
      case 'in-out':
        this.keysToEnter = [];
        this.keysToLeave = [];

        console.log('keysToLeave', keysToLeave, 'keysToEnter', keysToEnter);

        if (keysToEnter.length) {
          Promise.all(keysToEnter.map(this.performEnter))
            .then(function () {
              keysToLeave.forEach(this.performLeave)
            }.bind(this))
        } else {
          // this.keysToLeave = [];
          keysToLeave.forEach(this.performLeave)
        }
        break;
      default:
        this.keysToEnter = [];
        this.keysToLeave = [];
        keysToEnter.forEach(this.performEnter);
        keysToLeave.forEach(this.performLeave);
        break;
    }
  },

  performAppear: function(key) {
    this.currentlyEnteringOrEnteredKeys[key] = true;

    var component = this.refs[key];

    if (component.componentWillAppear) {
      component.componentWillAppear(
        this._handleDoneAppearing.bind(this, key)
      );
    } else {
      this._handleDoneAppearing(key);
    }
  },

  _handleDoneAppearing: function(key) {
    var component = this.refs[key];
    if (component.componentDidAppear) {
      component.componentDidAppear();
    }

    var currentChildMapping = ReactTransitionChildMapping.getChildMapping(
      this.props.children
    );

    if (!currentChildMapping || !currentChildMapping.hasOwnProperty(key)) {
      // This was removed before it had fully appeared. Remove it.
      this.performLeave(key);
    }
  },

  performEnter: function(key) {
    console.log('%c performEnter' + key, getColorByKey(key));

    this.cancelPending();


    var component = this.refs[key];

    if (!component) {
      console.log('%c no component' + key, getColorByKey(key));
      return Promise.resolve();
    }

    this.currentlyEnteringOrEnteredKeys[key] = true;

    var callback = this._handleDoneEntering.bind(this, key);
    this.pendingCallback = callback;
    // this.cancel = component.componentCancelledEnter && component.componentCancelledEnter.bind(component);

    return new Promise(function (resolve) {
      if (component.componentWillEnter) {
        console.log('%c waiting for willEnter to be called' + key, getColorByKey(key));
        component.componentWillEnter(resolve);
      } else {
        resolve();
      }
    }).then(callback);
  },

  _handleDoneEntering: function(key) {
    this.cancel = this.pendingCallback = null;

    var component = this.refs[key];
    if (component.componentDidEnter) {
      component.componentDidEnter();
    }

    var currentChildMapping = ReactTransitionChildMapping.getChildMapping(
      this.props.children
    );

    if (!currentChildMapping || !currentChildMapping.hasOwnProperty(key) && this.currentlyEnteringOrEnteredKeys[key]) {
      // This was removed before it had fully entered. Remove it.
      console.log('%c This was removed before it had fully entered. Remove it.' + key, getColorByKey(key));

      if (this.props.transitionMode !== 'in-out') {
        this.performLeave(key);
      }
      // this.keysToLeave = [];
      // delete this.keysToLeave[key];
      // this.keysToLeave.push(key);
      // this.forceUpdate();
    }
  },

  performLeave: function(key) {
    this.cancelPending();
    if (!this.currentlyEnteringOrEnteredKeys[key]) {
      console.log('%c not visible', getColorByKey(key));
      // not visible, no need to leave
      return Promise.resolve();
    }

    var component = this.refs[key];

    if (!component) {
      console.log('no component to leave!', key);
      return Promise.resolve();
    }

    this.currentlyLeavingKeys[key] = true;
    console.log('%c perform leave', getColorByKey(key));

    var callback = this._handleDoneLeaving.bind(this, key);
    this.pendingCallback = callback;
    // this.cancel = component.componentCancelledLeave && component.componentCancelledLeave.bind(component);

    return new Promise(function (resolve) {
      if (component.componentWillLeave) {
        // console.log('%c waiting for willLeave to be called' + key, getColorByKey(key));
        component.componentWillLeave(resolve);
      } else {
        resolve();
      }
    })
      // Note that this is somewhat dangerous b/c it calls setState()
      // again, effectively mutating the component before all the work
      // is done.
      .then(callback);
  },

  _handleDoneLeaving: function(key) {
    console.log('%c done leaving ' + key, getColorByKey(key));
    this.cancel = this.pendingCallback = null;

    var component = this.refs[key];

    if (component && component.componentDidLeave) {
      component.componentDidLeave();
    }

    delete this.currentlyLeavingKeys[key];

    var currentChildMapping = ReactTransitionChildMapping.getChildMapping(
      this.props.children
    );

    if (currentChildMapping && currentChildMapping.hasOwnProperty(key)) {
      // This entered again before it fully left. Add it again.
      console.log('%c This entered again before it fully left. Add it again.' + key, getColorByKey(key));
      // but only perform enter if currently animating out, not already animated out
      if (this.props.transitionMode !== 'in-out') {
        this.performEnter(key);
      }
      // this.keysToEnter = [];

      // delete this.keysToEnter[key];
      // this.keysToEnter.push(key);
      // this.forceUpdate();
    } else {
      delete this.currentlyEnteringOrEnteredKeys[key];
      this.setState(function(state) {
        var newChildren = assign({}, state.children);
        delete newChildren[key];
        return {children: newChildren};
      });
    }
  },

  cancelPending: function () {
    // if (this.cancel) {
    //   this.cancel();
    //   this.cancel = null;
    // }
    if (this.pendingCallback) {
      this.pendingCallback(true);
      this.pendingCallback = null;
    }
  },

  render: function() {
    // TODO: we could get rid of the need for the wrapper node
    // by cloning a single child
    var childrenToRender = [];
    for (var key in this.state.children) {
      var child = this.state.children[key];
      if (child) {
        // You may need to apply reactive updates to a child as it is leaving.
        // The normal React way to do it won't work since the child will have
        // already been removed. In case you need this behavior you can provide
        // a childFactory function to wrap every child, even the ones that are
        // leaving.
        childrenToRender.push(React.cloneElement(
          this.props.childFactory(child),
          {ref: key, key: key}
        ));
      }
    }
    return React.createElement(
      this.props.component,
      this.props,
      childrenToRender
    );
  },
});

module.exports = ReactTransitionGroupPlus;