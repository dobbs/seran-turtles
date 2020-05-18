import {TurtleGeometry, TAU} from "./turtle-geometry.mjs";

const template = document.createElement('template');
template.innerHTML = `
<style>
:host {
  display: block;
  width: 100%;
  min-height: 300px;
}
canvas {
  width: 100%;
  border: 1pt solid black;
}
</style>
<canvas width="500" height="500"></canvas>
<slot></slot>`
export class TurtleCanvas extends HTMLElement {
  constructor() {
    super()

    let shadow = this.attachShadow({mode: 'open'});
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this.turtle = new TurtleGeometry();
    this.clear();
  }

  get _canvas() {return this.shadowRoot.querySelector('canvas');}
  get _context() {return this._canvas.getContext('2d');}
  _contextClear() {
    const {_canvas, _context} = this;
    _context.resetTransform();
    _context.clearRect(0, 0, _canvas.width, _canvas.height);
  }
  _contextTransform() {
    // scale to fit the figure within _canvas context
    const {_canvas, _context} = this;
    const {width, height, centroid} = this.turtle.boundingBox
    const padding = 30;
    const ratio = {
      canvas: _canvas.width/_canvas.height,
      bounding: width/height
    };
    const scale = (ratio.canvas > ratio.bounding)
          ? (_canvas.height - padding) / height
          : (_canvas.width - padding) / width;
    // 1. position origin at center of _canvas
    _context.translate(_canvas.width / 2, _canvas.height / 2);
    // 2. scale drawing to fit _canvas
    _context.scale(scale, scale);
    // 3. adjust _context origin around coords of figure's centroid
    _context.translate(-centroid.x, -centroid.y);

    _context.lineWidth = 1 / scale;
  }

  move() { this.turtle.move(); return this; }
  turn() { this.turtle.turn(); return this; }
  clear() { this.turtle.clear(); return this; }
  nextMovesize() { this.turtle.nextMovesize(); return this; }
  nextTurnsizeNumerator() { this.turtle.nextTurnsizeNumerator(); return this; }
  nextTurnsizeDenominator() { this.turtle.nextTurnsizeDenominator(); return this; }

  draw() {
    const {_canvas, _context} = this;
    this._contextClear();
    this._contextTransform();
    _context.beginPath();
    this.turtle.history.forEach(({fn, state: {x, y}}) => {
      if (fn === 'clear') {
        _context.moveTo(x, y);
      } else if (fn === 'move') {
        _context.lineTo(x, y)
      }
    });
    _context.stroke();
    _context.restore();
    return this;
  }
}
