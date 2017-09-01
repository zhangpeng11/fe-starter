const ReactDOM = require('react-dom');
const render = ReactDOM.render;
const logs = window.__ReactRenderLogs__ = [];

window.__ReactDOMRender__ = function() {
  return render.apply(this, arguments);
}

ReactDOM.render = function () {
  if (arguments[0] && arguments[1]) {
    logs.pop();
    logs.push([arguments[0], arguments[1]]);
  }

  return render.apply(this, arguments);
}


