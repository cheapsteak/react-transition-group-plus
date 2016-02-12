# React TransitionGroupPlus [![npm](https://img.shields.io/npm/v/react-transition-group-plus.svg?style=flat-square)]()

A drop-in replacement for [ReactTransitionGroup](https://facebook.github.io/react/docs/animation.html#low-level-api-reacttransitiongroup) that adds the ability to specify transition order and makes transitions interruptable.

See a comparative [demo](http://cheapsteak.github.com/react-transition-group-plus/).

### Installation

```
npm install --save react-transition-group-plus
```

### Usage 

Usage of TransitionGroupPlus is nearly identical to ReactTransitionGroup. (See the [guide on react's website]((https://facebook.github.io/react/docs/animation.html#low-level-api-reacttransitiongroup)) on how to use ReactTransitionGroup)  

It takes an additional _optional_ prop `transitionMode` that can have the following values:  

- `simultaneous` _(default. you can leave out this prop out altogether)_  
  `componentWillEnter` and `componentWillLeave` will be run at the same time.  
- `out-in`  
  Wait for the outgoing component's `componentWillLeave` to finish before calling the incoming component's `componentWillEnter`.  
  Note:  
  If an incoming component needs to leave while it's still waiting for its `componentWillEnter` to be called, its `componentWillEnter` will be skipped and only its `componentWillLeave` will be called.
- `in-out`  
  Wait for the incoming component's `componentWillEnter` to finish before calling the outgoing component's `componentWillLeave`.

##### sample:
```js
<TransitionGroupPlus transitionMode="in-out">
  ...
</TransitionGroupPlus>
```

### Browser Support

This component relies on Promises, which exists natively in most browsers, but a polyfill would be required for IE11 and below.

Other than that, this should run on all browsers where React runs.

### License

Since this code was forked from React's ReactTransitionGroup, significant lines of codes still fall under React's original BSD license.  

New code is licensed under MIT


Inspired by [Vue's transitions](http://vuejs.org/guide/transitions.html#JavaScript_Transitions)