"use strict";

var scripts = document.getElementsByTagName("script"),
    scriptUrl = scripts[scripts.length - 1].src,
    root = scriptUrl.split("master-loader.js")[0],
    loaders = {
        unity: "unity.js",
        "unity-beta": "unity-beta.js",
        "unity-2020": "unity-2020.js"
    };

if (0 <= window.location.href.indexOf("pokiForceLocalLoader") && (loaders.unity = "/unity/dist/unity.js", loaders["unity-beta"] = "/unity-beta/dist/unity-beta.js", loaders["unity-2020"] = "/unity-2020/dist/unity-2020.js", root = "/loaders"), !window.config) throw Error("window.config not found");

var loader = loaders[window.config.loader];
if (!loader) throw Error('Loader "' + window.config.loader + '" not found');

if (!window.config.unityWebglLoaderUrl) {
    var versionSplit = window.config.unityVersion ? window.config.unityVersion.split(".") : [],
        year = versionSplit[0],
        minor = versionSplit[1];
    switch (year) {
        case "2019":
            window.config.unityWebglLoaderUrl = 1 === minor ? "UnityLoader.2019.1.js" : "UnityLoader.2019.2.js";
            break;
        default:
            window.config.unityWebglLoaderUrl = "UnityLoader.js"
    }
}

var sdkScript = document.createElement("script");
sdkScript.src = "poki-sdk.js";
sdkScript.onload = function() {
    var i = document.createElement("script");
    i.src = root + loader;
    document.body.appendChild(i);
};
document.body.appendChild(sdkScript);

// =============== MYNVO PATCH - Gestion des touches personnalisées ===============
console.log("%c[MYNVO GAME] Touch remapping system loaded", "color: #00ff00; font-weight: bold;");

// État des touches pressées (pour éviter les répétitions)
const keysPressed = {};

// Réception des messages depuis le parent
window.addEventListener("message", (e) => {
    const data = e.data;
    if (!data || !data.type) return;

    // Gestion keydown
    if (data.type === "keydown") {
        const key = data.key;
        const keyCode = data.keyCode;
        
        // Éviter les répétitions
        if (keysPressed[keyCode]) return;
        keysPressed[keyCode] = true;
        
        console.log("%c[MYNVO GAME] ⬇️ Keydown:", "color: #00ff00;", key, "keyCode:", keyCode);
        
        // Méthode 1: Dispatcher avec keyCode (compatible vieux navigateurs)
        const event1 = new KeyboardEvent("keydown", {
            keyCode: keyCode,
            which: keyCode,
            bubbles: true,
            cancelable: true
        });
        
        // Méthode 2: Dispatcher avec key moderne
        const event2 = new KeyboardEvent("keydown", {
            key: key,
            code: getCodeFromKeyCode(keyCode),
            keyCode: keyCode,
            which: keyCode,
            bubbles: true,
            cancelable: true,
            composed: true
        });
        
        // Dispatcher sur TOUS les éléments possibles
        document.dispatchEvent(event1);
        document.dispatchEvent(event2);
        window.dispatchEvent(event1);
        window.dispatchEvent(event2);
        
        // Canvas Unity
        const canvas = document.querySelector("canvas");
        if (canvas) {
            canvas.dispatchEvent(event1);
            canvas.dispatchEvent(event2);
        }
        
        // Tous les éléments Unity possibles
        document.querySelectorAll("#canvas, #unity-canvas, [id*='canvas']").forEach(el => {
            el.dispatchEvent(event1);
            el.dispatchEvent(event2);
        });
    }

    // Gestion keyup
    if (data.type === "keyup") {
        const key = data.key;
        const keyCode = data.keyCode;
        
        keysPressed[keyCode] = false;
        
        console.log("%c[MYNVO GAME] ⬆️ Keyup:", "color: #ff6b6b;", key, "keyCode:", keyCode);
        
        const event1 = new KeyboardEvent("keyup", {
            keyCode: keyCode,
            which: keyCode,
            bubbles: true,
            cancelable: true
        });
        
        const event2 = new KeyboardEvent("keyup", {
            key: key,
            code: getCodeFromKeyCode(keyCode),
            keyCode: keyCode,
            which: keyCode,
            bubbles: true,
            cancelable: true,
            composed: true
        });
        
        document.dispatchEvent(event1);
        document.dispatchEvent(event2);
        window.dispatchEvent(event1);
        window.dispatchEvent(event2);
        
        const canvas = document.querySelector("canvas");
        if (canvas) {
            canvas.dispatchEvent(event1);
            canvas.dispatchEvent(event2);
        }
        
        document.querySelectorAll("#canvas, #unity-canvas, [id*='canvas']").forEach(el => {
            el.dispatchEvent(event1);
            el.dispatchEvent(event2);
        });
    }
});

// Helper: Convertir keyCode en code
function getCodeFromKeyCode(keyCode) {
    const codeMap = {
        38: 'ArrowUp',
        40: 'ArrowDown',
        37: 'ArrowLeft',
        39: 'ArrowRight',
        32: 'Space',
        87: 'KeyW',
        65: 'KeyA',
        83: 'KeyS',
        68: 'KeyD',
        90: 'KeyZ',
        81: 'KeyQ'
    };
    return codeMap[keyCode] || '';
}

// Attendre que Unity soit chargé
window.addEventListener("load", () => {
    console.log("%c[MYNVO GAME] ✅ Game loaded!", "color: #ffd700; font-weight: bold;");
    
    // Envoyer confirmation au parent
    if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: "mynvo_game_loaded" }, "*");
    }
    
    // Attendre le canvas Unity
    let canvasFound = false;
    const checkCanvas = setInterval(() => {
        const canvas = document.querySelector("canvas");
        if (canvas && !canvasFound) {
            canvasFound = true;
            console.log("%c[MYNVO GAME] 🎮 Unity canvas detected!", "color: #00ff00; font-weight: bold;");
            clearInterval(checkCanvas);
            
            // Focus sur le canvas
            canvas.setAttribute("tabindex", "1");
            canvas.focus();
            
            // Logger pour debug
            canvas.addEventListener("keydown", (e) => {
                console.log("%c[MYNVO GAME] 🎯 Canvas received keydown:", "color: #58a6ff;", e.keyCode);
            });
            
            canvas.addEventListener("keyup", (e) => {
                console.log("%c[MYNVO GAME] 🎯 Canvas received keyup:", "color: #58a6ff;", e.keyCode);
            });
        }
    }, 100);
    
    // Timeout de sécurité
    setTimeout(() => clearInterval(checkCanvas), 10000);
});

// DEBUG: Logger tous les événements natifs (pour vérifier)
if (window.location.href.includes("debug")) {
    document.addEventListener("keydown", (e) => {
        console.log("[DEBUG GAME] Native keydown:", {
            key: e.key,
            keyCode: e.keyCode,
            code: e.code,
            which: e.which
        });
    }, true);
    
    document.addEventListener("keyup", (e) => {
        console.log("[DEBUG GAME] Native keyup:", {
            key: e.key,
            keyCode: e.keyCode,
            code: e.code,
            which: e.which
        });
    }, true);
}

console.log("%c[MYNVO GAME] 🚀 Master loader initialized - Waiting for postMessage...", "color: #58a6ff; font-weight: bold;");
