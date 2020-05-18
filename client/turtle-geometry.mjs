export const TAU = Math.PI * 2
export class TurtleGeometry {
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
  set history(json) {
    const [origin,...tail] = this._history = json;
    const moment = tail.pop();
    this._origin = origin.state;
    this._moment = moment.state;
  }

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
