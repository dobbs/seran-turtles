import * as wiki from "seran/wiki.ts";
import { Request } from "seran/wiki.ts";
import { System, MetaSite } from "seran/system.ts";

//export let plugins = ["/turtle.mjs"];

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
  // building a JSON blob from req.body.read 'cos I can't find a
  // higher-level API. but seems hard to believe I haven't missed
  // something obvious.
  // copied a bunch of this from deno's http server source:
  // https://github.com/denoland/deno/blob/bced52505f32d6cca4f944bb610a8a26767908a8/std/http/server.ts#L57-L66
  const buf = new Uint8Array(req.contentLength);
  let bufSlice = buf;
  let totRead = 0;
  while (true) {
    const nread = await req.body.read(bufSlice);
    if (nread === Deno.EOF) break;
    totRead += nread;
    if (totRead >= req.contentLength) break;
    bufSlice = bufSlice.subarray(nread);
  }
  let body = JSON.parse(String.fromCharCode(...buf))
  console.log({where: 'POST /turtle/save', id:body.id, historyLength:body.history.length});
  turtle[body.id] = body;
  wiki.serveJson(req, {success: true, ...body});
  return;
};

export let handler = new wiki.Handler();
handler.plugins(`file:///${Deno.cwd()}`, 'client');
handler.page(wiki.welcomePage("[[DenoWiki]]", "[[Wander]]"));
handler.items(
  "Wander", () => Object.entries(turtle).map(([_, it]) => wiki.item("turtle", it))
);
