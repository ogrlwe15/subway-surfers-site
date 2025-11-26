"use strict";

// Récupère le chemin du script
var scripts = document.getElementsByTagName("script"),
    scriptUrl = scripts[scripts.length - 1].src,
    root = scriptUrl.split("master-loader.js")[0];

// Charge le bon loader Unity
var loaders = { unity: "unity.js" };
if (!window.config) throw Error("window.config not found");
var loader = loaders[window.config.loader] || "unity.js";

// Charge le loader Unity directement
var script = document.createElement("script");
script.src = root + loader;
document.body.appendChild(script);

console.log("%c[MYNVO] Loader Unity chargé", "color: #00ff00; font-weight: bold;");
