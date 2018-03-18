# React TransitionGroupPlus  

[![npm](https://img.shields.io/npm/v/react-transition-group-plus.svg)](https://www.npmjs.com/package/react-transition-group-plus)  [![npm](https://img.shields.io/npm/dt/react-transition-group-plus.svg)](https://npmcharts.com/compare/react-transition-group-plus?minimal=true)

A drop-in replacement for the original react-addons-transition-group that allows interruptible transitions and specifying transition order. 

**Note that this is not API-compatible with react-transition-group v2**

### Installation

```
npm install --save react-transition-group-plus
```

### Demo
See a **[comparative demo](http://cheapsteak.github.com/react-transition-group-plus/)** between ReactTransitionGroup and TransitionGroupPlus

Aside from being able to specify transition order, notice how a component's enter transition is aborted and the leave transition runs as soon as a component should no longer be active.  

### Why?

ReactTransitionGroup has a few shortcomings  

- **Animation order can't be specified.**   
  Different components' `componentWillEnter` and `componentWillLeave` always occur simultaneously.  
  It's difficult to wait for the outgoing component's `componentWillLeave` to finish before running the incoming component's `componentWillEnter`. 

- **The same component's transitions can't be interrupted**.  
  Once a component's `componentWillEnter` is called, calls to the same component's `componentWillLeave` will be delayed until the enter animation finishes   
  This problem becomes apparent for page transitions and carousels, when something that's entering might need to immediately exit.  

TransitionGroupPlus builds upon ReactTransitionGroup's existing code to solve these problems.  


### Usage 

Usage of TransitionGroupPlus is nearly identical to ReactTransitionGroup. (See the [guide on react's website](https://facebook.github.io/react/docs/animation.html#low-level-api-reacttransitiongroup) on how to use ReactTransitionGroup)  

Additional props: 

- **`transitionMode`** (optional) 
  can have the following values:  
  - `simultaneous` _(default)_  
    `componentWillEnter` and `componentWillLeave` will be run at the same time.  
    The `transitionMode` prop can be omitted if simultaneous transitions are desired as this is the default value.  
  - `out-in`  
    Wait for the outgoing component's `componentWillLeave` to finish before calling the incoming component's `componentWillEnter`.  
    Note:  
    If an incoming component needs to leave while it's still waiting for its `componentWillEnter` to be called, its `componentWillEnter` will be skipped and only its `componentWillLeave` will be called.
  - `in-out`  
    Wait for the incoming component's `componentWillEnter` to finish before calling the outgoing component's `componentWillLeave`.
- **`deferLeavingComponentRemoval`** (optional, boolean, defaults to `false`)  
  When `true`, children that leave will not be removed immediately after their `componentWillLeave` is called, but will wait for the next component's `componentWillEnter` to finish.  
  Only affects the transition modes "simultaneous" and "out-in". Has no effect on "in-out".  

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
