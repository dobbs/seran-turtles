import {TAU} from "./turtle-geometry.mjs";
const buttonTemplate = document.createElement('template');
buttonTemplate.innerHTML = `
<style>
:host {
  display: inline-block;
}
canvas {
  width: 100%;
  border: 1pt solid black;
}
</style>
<canvas width="32" height="32"></canvas>`
export class TurnButton extends HTMLElement {
  static get observedAttributes() {
    return ['numerator', 'denominator', 'width', 'height', 'anticlockwise'];
  }
  constructor() {
    super()
    let shadow = this.attachShadow({mode: 'open'});
    this.shadowRoot.appendChild(buttonTemplate.content.cloneNode(true));
    this.canvas = this.shadowRoot.querySelector('canvas');
  }
  connectedCallback() {
    if (this.width == null) { this.width=this.canvas.width; }
    if (this.height == null) { this.height=this.canvas.height; }
    if (this.numerator == null) { this.numerator = 1; }
    if (this.denominator == null) { this.denominator = 6; }
    this.draw();
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (['width', 'height'].includes(name)) {
      this.canvas.setAttribute(name, newValue);
    }
    this.draw();
  }
  // TODO should we enforce inputs?
  // e.g. restrict rotation to CLOCKWISE or COUNTERCLOCKWISE?
  // e.g. restrict inputs to the setters to integer values
  get context() { return this.canvas.getContext('2d'); }
  get width() { return this.getAttribute('width'); }
  set width(int) { this.setAttribute('width', int); }
  get height() { return this.getAttribute('height'); }
  set height(int) { this.setAttribute('height', int); }
  get numerator() { return this.getAttribute('numerator'); }
  set numerator(int) { this.setAttribute('numerator', int); }
  get denominator() { return this.getAttribute('denominator'); }
  set denominator(int) { this.setAttribute('denominator', int); }
  get anticlockwise() { return this.hasAttribute('anticlockwise'); }
  set anticlockwise(bool) {
    if (bool) {
      this.setAttribute('anticlockwise', '');
    } else {
      this.removeAttribute('anticlockwise');
    }
  }
  get _radius() { return Math.min(this.width, this.height)/2 - 2; }
  draw() {
    this._xformCoordinatesFromCanvasToTurtle();
    this.drawNumerator();
    this.drawDenominator();
    this._restoreCoordinatesToCanvas();
  }
  drawNumerator() {
    const {context, _radius, numerator, denominator} = this;
    console.log({context, _radius})
    context.beginPath();
    context.moveTo(0, 0);
    context.arc(0, 0, _radius, 0, TAU*numerator/denominator);
    context.fillStyle = '#777';
    context.fill();
  }
  drawDenominator() {
    const {context, _radius, numerator, denominator} = this;
    context.beginPath();
    context.moveTo(0, 0);
    context.arc(0, 0, _radius, 0, TAU);
    context.closePath();
    for (var i = 0; i < denominator; i++) {
      context.moveTo(0, 0);
      context.lineTo(_radius * Math.cos(TAU*i/denominator),
                     _radius * Math.sin(TAU*i/denominator));
    }
    context.strokeStyle = '#aaa';
    context.stroke();
  }
  _xformCoordinatesFromCanvasToTurtle() {
    // HTML canvas points 0 radians to the east
    // Turtle geometry points 0 radians to the north
    const {context, width, height, anticlockwise} = this;
    context.clearRect(0, 0, width, height);
    context.save();
    context.translate(width/2, height/2);
    if (anticlockwise)
      context.scale(-1, 1);
    context.rotate(-Math.PI/2);
  }
  _restoreCoordinatesToCanvas() {
    this.context.restore()
  }
}

export class TurtleControls extends HTMLElement {
  connectedCallback() {
    this.innerHTML = '<turn-button />'
  }
}

if (customElements) {
  if (! customElements.get('turn-button')) {
    customElements.define('turn-button', TurnButton);
  }
  if (! customElements.get('turtle-controls')) {
    customElements.define('turtle-controls', TurtleControls);
  }
}
