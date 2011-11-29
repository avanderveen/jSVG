// reframe on window resize
var jSVG = function(svg_selector, doc) {
  var svg = $(svg_selector);
  var svgG = svg.get(0).ownerDocument.createElementNS("http://www.w3.org/2000/svg", "g");
  svg.wrapInner(svgG);
  this.origFrame = [0, 0, svg.width(), svg.height()];

  var that = {
    frame: this.origFrame,
    mouseWheelSens: 1.1,
    reframe: function(_frame, newOrigin) {
      var lastFrame = this.frame;
      this.frame = _frame;

      var changeWidth = Math.abs(this.frame[2] - this.frame[0]) / Math.abs(lastFrame[2] - lastFrame[0]);
      var changeHeight = Math.abs(this.frame[3] - this.frame[1]) / Math.abs(lastFrame[3] - lastFrame[1]);
      var scale = (changeWidth > changeHeight) ? changeWidth : changeHeight;

      var transMatrix = svg.get(0).createSVGMatrix();
      if (newOrigin) {
        transMatrix = transMatrix.translate(newOrigin[0], newOrigin[1]);
        transMatrix = transMatrix.scale(scale);
        transMatrix = transMatrix.translate(-newOrigin[0], -newOrigin[1]);
      } else
        transMatrix = transMatrix.scale(scale);
      transMatrix = svgG.getCTM().multiply(transMatrix);
      var mtxStr = "matrix(" + transMatrix.a + "," + transMatrix.b + "," + transMatrix.c + "," +
                   transMatrix.d + "," + transMatrix.e + "," + transMatrix.f + ")";
      svgG.setAttribute("transform",  mtxStr); // doesn't work in WebKit
      console.log($(svgG).attr("transform"));

      return this.frame;
    },
    resetFrame: function() {
      return this.reframe([0, 0, svg.width(), svg.height()]);
    },
    zoom: function(factor, reticle) {
      var width = this.frame[2] - this.frame[0];
      var height = this.frame[3] - this.frame[1];
      var x = Math.floor((width * factor - width) / 2);
      var y = Math.floor((height * factor - height) / 2);
      if (reticle && reticle.length == 2)
        return this.reframe([this.frame[0] - x, this.frame[1] - y,
                this.frame[2] + x, this.frame[3] + y], reticle);
      else
        return this.reframe([this.frame[0] - x, this.frame[1] - y, this.frame[2] + x, this.frame[3] + y]);
    },
    pan: function(x, y) {
      if (this.frame.length != 4)
        this.resetFrame();
      return this.reframe([this.frame[0] + x, this.frame[1] + y, this.frame[2] + x, this.frame[3] + y]);
    },
  };

  function wheelEvent(event) {
    var delta = 0;
    if (!event)
      event = window.event;
    
    if (event.wheelDelta) {
      delta = event.wheelDelta / 120;
      if (window.opera)
        delta = -delta;
    } else if (event.detail) {
      delta = event.detail / -3;
    }
    
    if (delta)
      that.zoom(delta * that.mouseWheelSens, [event.pageX, event.pageY]);
    
    if (event.preventDefault)
      event.preventDefault();
    event.returnValue = false;
    return false;
  };

  $(window).delegate("svg", "mousewheel DOMMouseScroll", wheelEvent);

  return that;
}
