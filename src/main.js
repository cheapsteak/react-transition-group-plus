if(module.hot) {
  // Accept loading this module again when a dependency updates
  module.hot.accept();
}

require('./main.jsx');