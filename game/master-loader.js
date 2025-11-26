"use strict";
var scripts = document.getElementsByTagName("script"),
    scriptUrl = scripts[scripts.length - 1].src,
    root = scriptUrl.split("master-loader.js")[0];
var loaders = { unity: "unity.js" };
if (!window.config) throw Error("window.config not found");
var loader = loaders[window.config.loader] || "unity.js";
var script = document.createElement("script");
script.src = root + loader;
document.body.appendChild(script);
console.log("%c[MYNVO] Loader chargé", "color: #00ff00;");
