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
var PropTypes = require('prop-types');
var createReactClass = require('create-react-class');
var difference = require('lodash.difference');
var keyBy = require('lodash.keyby');

var assign = require('object-assign');

var getChildMapping = function (children) {
  return keyBy(
    React.Children.toArray(
      children
    ),
    function(child) {
      return child.key;
    }
  );
};

var ReactTransitionGroupPlus = createReactClass({
  displayName: 'ReactTransitionGroupPlus',

  propTypes: {
    component: PropTypes.any,
    childFactory: PropTypes.func,
    transitionMode: PropTypes.oneOf(['in-out', 'out-in', 'simultaneous']),
    deferLeavingComponentRemoval: PropTypes.bool,
  },

  getDefaultProps: function() {
    return {
      component: 'span',
      childFactory: function (arg) {
        return arg;
      },
      transitionMode: 'simultaneous',
      deferLeavingComponentRemoval: false,
    };
  },

  getInitialState: function() {
    return {
      children: getChildMapping(this.props.children),
    };
  },

  componentWillMount: function() {
    this.currentlyEnteringOrEnteredKeys = {};
    this.currentlyEnteringKeys = {};
    this.currentlyEnteringPromises = {};
    this.currentlyLeavingKeys = {};
    this.currentlyLeavingPromises = {};
    this.pendingEnterCallbacks = {};
    this.pendingLeaveCallbacks = {};
    this.deferredLeaveRemovalCallbacks = [];
    this.keysToEnter = [];
    this.keysToLeave = [];
    this.cancel = null;
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
    var nextChildMapping = getChildMapping(
      nextProps.children
    );
    var prevChildMapping = this.state.children;

    var mergedChildMapping = assign({},
      prevChildMapping,
      nextChildMapping
    );
    this.setState({
      children: mergedChildMapping
    });

    var key;

    for (key in nextChildMapping) {
      var hasPrev = prevChildMapping && prevChildMapping.hasOwnProperty(key);
      if (nextChildMapping[key] && ( !hasPrev || this.currentlyLeavingKeys[key])) {
        this.keysToEnter.push(key);
      }
    }

    for (key in prevChildMapping) {
      var hasNext = nextChildMapping && nextChildMapping.hasOwnProperty(key);
      if (prevChildMapping[key] && !hasNext ) {
        this.keysToLeave.push(key);
      }
    }

    if (this.props.transitionMode === 'out-in') {
      this.keysToEnter = difference(this.keysToEnter, this.keysToLeave);
    }

    // If we want to someday check for reordering, we could do it here.
  },

  componentDidUpdate: function() {
    var keysToEnter = this.keysToEnter;
    var keysToLeave = this.keysToLeave;

    switch (this.props.transitionMode) {
      case 'out-in':
        this.keysToLeave = [];
        if (keysToLeave.length) {
          keysToLeave.forEach(this.performLeave)
        } else {
          this.keysToEnter = [];
          keysToEnter.forEach(this.performEnter)
        }
        break;
      case 'in-out':
        this.keysToEnter = [];
        this.keysToLeave = [];

        if (keysToEnter.length) {
          Promise.all(keysToEnter.map(this.performEnter))
            .then(function () {
              keysToLeave.forEach(this.performLeave)
            }.bind(this))
        } else {
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
    if (component && component.componentDidAppear) {
      component.componentDidAppear();
    }

    var currentChildMapping = getChildMapping(
      this.props.children
    );

    if (!currentChildMapping || !currentChildMapping.hasOwnProperty(key)) {
      // This was removed before it had fully appeared. Remove it.
      this.performLeave(key);
    }
  },

  performEnter: function(key) {

    if (this.currentlyEnteringKeys[key]) {
      return this.currentlyEnteringPromises[key];
    }

    this.cancelPendingLeave(key);


    var component = this.refs[key];

    if (!component) {
      return Promise.resolve();
    }

    this.currentlyEnteringOrEnteredKeys[key] = true;
    this.currentlyEnteringKeys[key] = true;

    var callback = this._handleDoneEntering.bind(this, key);
    this.pendingEnterCallbacks[key] = callback;

    var enterPromise = new Promise(function (resolve) {
      if (component.componentWillEnter) {
        component.componentWillEnter(resolve);
      } else {
        resolve();
      }
    }).then(callback);

    this.currentlyEnteringPromises[key] = enterPromise;

    return enterPromise;
  },

  _handleDoneEntering: function(key) {
    delete this.pendingEnterCallbacks[key];
    delete this.currentlyEnteringPromises[key];
    delete this.currentlyEnteringKeys[key];

    this.deferredLeaveRemovalCallbacks.forEach(function(fn) { fn(); });
    this.deferredLeaveRemovalCallbacks = [];

    var component = this.refs[key];
    if (component && component.componentDidEnter) {
      component.componentDidEnter();
    }

    var currentChildMapping = getChildMapping(
      this.props.children
    );

    if (!currentChildMapping || !currentChildMapping.hasOwnProperty(key) && this.currentlyEnteringOrEnteredKeys[key]) {
      // This was removed before it had fully entered. Remove it.

      if (this.props.transitionMode !== 'in-out') {
        this.performLeave(key);
      }
    }
  },

  performLeave: function(key) {
    if (this.currentlyLeavingKeys[key]) {
      //already leaving, let it finish
      return this.currentlyLeavingPromises[key];
    }

    this.cancelPendingEnter(key);

    var component = this.refs[key];

    if (!component) {
      return Promise.resolve();
    }

    this.currentlyLeavingKeys[key] = true;

    var callback = this._handleDoneLeaving.bind(this, key);
    this.pendingLeaveCallbacks[key] = callback;

    var leavePromise = new Promise(function (resolve) {
      if (component.componentWillLeave) {
        component.componentWillLeave(resolve);
      } else {
        resolve();
      }
    })
      // Note that this is somewhat dangerous b/c it calls setState()
      // again, effectively mutating the component before all the work
      // is done.
      .then(callback);

    this.currentlyLeavingPromises[key] = leavePromise;
    return leavePromise;
  },

  _handleDoneLeaving: function(key) {
    delete this.pendingLeaveCallbacks[key];
    delete this.currentlyLeavingKeys[key];
    delete this.currentlyLeavingPromises[key];

    var component = this.refs[key];

    if (component && component.componentDidLeave) {
      component.componentDidLeave();
    }


    var currentChildMapping = getChildMapping(
      this.props.children
    );

    var updateChildren = function updateChildren () {
      this.setState(function(state) {
        var newChildren = assign({}, state.children);
        delete newChildren[key];
        return {children: newChildren};
      });
    }.bind(this);

    if (currentChildMapping && currentChildMapping.hasOwnProperty(key)) {
      // This entered again before it fully left. Add it again.
      // but only perform enter if currently animating out, not already animated out
      if (this.props.transitionMode !== 'in-out') {
        this.performEnter(key);
      }
    } else {
      delete this.currentlyEnteringOrEnteredKeys[key];

      if (this.props.deferLeavingComponentRemoval && this.props.transitionMode !== 'in-out') {
        this.deferredLeaveRemovalCallbacks.push(updateChildren);
        this.forceUpdate();
      } else {
        updateChildren();
      }
    }
  },

  cancelPendingLeave: function (key) {
    if (this.pendingLeaveCallbacks[key]) {
      this.pendingLeaveCallbacks[key]();
      delete this.pendingLeaveCallbacks[key];
    }
  },

  cancelPendingEnter: function (key) {
    if (this.pendingEnterCallbacks[key]) {
      this.pendingEnterCallbacks[key]();
      delete this.pendingEnterCallbacks[key];
    }
  },

  cleanProps: function(props) {
    delete props.component;
    delete props.transitionMode;
    delete props.childFactory;
    delete props.deferLeavingComponentRemoval;
    return props;
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
      this.cleanProps(assign({},this.props)),
      childrenToRender
    );
  },
});

module.exports = ReactTransitionGroupPlus;
