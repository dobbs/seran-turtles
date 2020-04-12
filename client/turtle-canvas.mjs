const TAU = Math.PI * 2
export class Turtle {
  constructor(origin={}, options={}) {
    this._origin = {
      name: "origin",
      x: 0,
      y: 0,
      direction: -TAU/4,
      pensize: 1,
      pencolor: 'black',
      movesize: 30,
      turnsize: TAU/6,
      turnsizeNumerator: 1,
      turnsizeDenominator: 6,
      ...origin
    };

    this._options = {
      movesize: Array.from({length:16}, (_,i) => (i+1)*5),
      turnsizeNumerator: [...Array.from({length:16}, (_,i) => i+1)],
      turnsizeDenominator: [...Array.from({length:16}, (_,i) => i+1)],
      ...options
    };

    this.clear();
  }

  get moment() {return {...this._moment};}
  get origin() {return {...this._origin};}
  get options() {return {...this._options};}
  get history() {return [...this._history];}

  clear() {
    this._moment = this.origin;
    this._history = [{
      fn: 'clear',
      beforestate: {},
      state: this.moment
    }];
    return this;
  }

  turn() {
    let beforestate = this.moment;
    let {direction, turnsize} = beforestate;
    let newdirection = direction + turnsize;
    while (newdirection > TAU) {
      newdirection = newdirection - TAU;
    }
    while (newdirection < 0) {
      newdirection = newdirection + TAU;
    }

    let state = this._moment = {
      ...beforestate,
      direction: newdirection
    };
    this._history.push({
      fn: 'turn',
      beforestate,
      state
    });
    return this;
  }

  move() {
    let beforestate = this.moment;
    let {x, y, direction, movesize} = beforestate;
    let state = this._moment = {
      ...beforestate,
      x: Math.cos(direction) * movesize + x,
      y: Math.sin(direction) * movesize + y
    };
    this._history.push({
      fn: 'move',
      beforestate,
      state
    });
    return this;
  }

  nextMovesize() {
    let beforestate = this.moment;
    let movesize = this.options.movesize
        .find(size => size > beforestate.movesize) ||
        this.options.movesize[0];
    let state = this._moment = {
      ...beforestate,
      movesize
    }
    this._history.push({
      fn: 'nextMovesize',
      beforestate,
      state
    });
    return this;
  }

  nextTurnsizeNumerator() {
    let beforestate = this.moment;
    let turnsizeNumerator = this.options.turnsizeNumerator
        .find(n => n > beforestate.turnsizeNumerator) ||
        this.options.turnsizeNumerator[0];
    let turnsize = TAU * turnsizeNumerator / beforestate.turnsizeDenominator;
    let state = this._moment = {
      ...beforestate,
      turnsize,
      turnsizeNumerator
    }
    this._history.push({
      fn: 'nextTurnsizeNumerator',
      beforestate,
      state
    });
    return this;
  }

  nextTurnsizeDenominator() {
    let beforestate = this.moment;
    let turnsizeDenominator = this.options.turnsizeDenominator
        .find(n => n > beforestate.turnsizeDenominator) ||
        this.options.turnsizeDenominator[0];
    let turnsize = TAU * beforestate.turnsizeNumerator / turnsizeDenominator;
    let state = this._moment = {
      ...beforestate,
      turnsize,
      turnsizeDenominator
    }
    this._history.push({
      fn: 'nextTurnsizeDenominator',
      beforestate,
      state
    });
    return this;
  }

  get boundingBox() {
    let box = this.history.reduce((bounds, {state: {x, y}}) => {
      return {
        Xmin: Math.min(bounds.Xmin, Math.floor(x)),
        Ymin: Math.min(bounds.Ymin, Math.floor(y)),
        Xmax: Math.max(bounds.Xmax, Math.ceil(x)),
        Ymax: Math.max(bounds.Ymax, Math.ceil(y)),
      }
    }, {
      Xmin:Number.MAX_SAFE_INTEGER,
      Ymin:Number.MAX_SAFE_INTEGER,
      Xmax:Number.MIN_SAFE_INTEGER,
      Ymax:Number.MIN_SAFE_INTEGER
    });
    box.width = box.Xmax - box.Xmin;
    box.height = box.Ymax - box.Ymin;
    box.centroid = {
      x: (box.Xmax + box.Xmin)/2,
      y: (box.Ymax + box.Ymin)/2
    };
    return box;
  }
}

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

    this.turtle = new Turtle();
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

export class TurtlePlugin {
  constructor(wiki) {
    this.wiki = wiki;
    window.customElements.define('turtle-canvas', TurtleCanvas);
  }

  emit($item, item) {
    $item.html(`<turtle-canvas />`);
    let tc = $item.find('turtle-canvas').get(0);
    if (item.history) {
      tc.turtle._history = [...item.history];
      tc.draw();
    }
    console.log({where: 'TurtlePlugin.emit', tc});
  }

  bind($item, item) {
  }
}
