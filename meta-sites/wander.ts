import * as wiki from "seran/wiki.ts";
import { Request } from "seran/wiki.ts";
import { System, MetaSite } from "seran/system.ts";

let turtle = {
  saved: {
    history: [{"fn":"clear","beforestate":{},"state":{"name":"origin","x":0,"y":0,"direction":-1.5707963267948966,"pensize":1,"pencolor":"black","movesize":30,"turnsize":1.0471975511965976,"turnsizeNumerator":1,"turnsizeDenominator":6}},{"fn":"turn","beforestate":{"name":"origin","x":0,"y":0,"direction":-1.5707963267948966,"pensize":1,"pencolor":"black","movesize":30,"turnsize":1.0471975511965976,"turnsizeNumerator":1,"turnsizeDenominator":6},"state":{"name":"origin","x":0,"y":0,"direction":5.759586531581287,"pensize":1,"pencolor":"black","movesize":30,"turnsize":1.0471975511965976,"turnsizeNumerator":1,"turnsizeDenominator":6}},{"fn":"move","beforestate":{"name":"origin","x":0,"y":0,"direction":5.759586531581287,"pensize":1,"pencolor":"black","movesize":30,"turnsize":1.0471975511965976,"turnsizeNumerator":1,"turnsizeDenominator":6},"state":{"name":"origin","x":25.980762113533153,"y":-15.000000000000014,"direction":5.759586531581287,"pensize":1,"pencolor":"black","movesize":30,"turnsize":1.0471975511965976,"turnsizeNumerator":1,"turnsizeDenominator":6}},{"fn":"turn","beforestate":{"name":"origin","x":25.980762113533153,"y":-15.000000000000014,"direction":5.759586531581287,"pensize":1,"pencolor":"black","movesize":30,"turnsize":1.0471975511965976,"turnsizeNumerator":1,"turnsizeDenominator":6},"state":{"name":"origin","x":25.980762113533153,"y":-15.000000000000014,"direction":0.5235987755982983,"pensize":1,"pencolor":"black","movesize":30,"turnsize":1.0471975511965976,"turnsizeNumerator":1,"turnsizeDenominator":6}},{"fn":"nextMovesize","beforestate":{"name":"origin","x":25.980762113533153,"y":-15.000000000000014,"direction":0.5235987755982983,"pensize":1,"pencolor":"black","movesize":30,"turnsize":1.0471975511965976,"turnsizeNumerator":1,"turnsizeDenominator":6},"state":{"name":"origin","x":25.980762113533153,"y":-15.000000000000014,"direction":0.5235987755982983,"pensize":1,"pencolor":"black","movesize":35,"turnsize":1.0471975511965976,"turnsizeNumerator":1,"turnsizeDenominator":6}},{"fn":"move","beforestate":{"name":"origin","x":25.980762113533153,"y":-15.000000000000014,"direction":0.5235987755982983,"pensize":1,"pencolor":"black","movesize":35,"turnsize":1.0471975511965976,"turnsizeNumerator":1,"turnsizeDenominator":6},"state":{"name":"origin","x":56.29165124598852,"y":2.499999999999968,"direction":0.5235987755982983,"pensize":1,"pencolor":"black","movesize":35,"turnsize":1.0471975511965976,"turnsizeNumerator":1,"turnsizeDenominator":6}}]
  }
};

async function turtleSave(req: Request) {
  if (req.method != "POST") {
    // Different status code?
    wiki.serve404(req);
    return
  }
  const decoder = new TextDecoder('utf-8');
  const text = decoder.decode(await Deno.readAll(req.body));
  const body = JSON.parse(text);
  console.log({where: 'POST /turtle/save', id:body.id, historyLength:body.history.length});
  turtle[body.id] = body;
  wiki.serveJson(req, {success: true, ...body});
  return;
};

export const plugins = ["/turtle.mjs"];
export const handler = new wiki.Handler();
handler.plugins(import.meta.url, 'client');
handler.page(wiki.welcomePage("[[DenoWiki]]", "[[Wander]]"));
handler.page({
  title: 'Wander',
  story: () => {
    console.log({where: 'Wander handler', turtles: Object.keys(turtle)});
    return Object.entries(turtle).map(([_, it]) => wiki.item("turtle", it));
  },
});
handler.route('/turtle/save', turtleSave);
