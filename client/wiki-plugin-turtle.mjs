import {TurtleCanvas} from "./turtle-canvas.mjs";
export class WikiPluginTurtle {
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
