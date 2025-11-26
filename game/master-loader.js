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
console.log("%c[MYNVO] Touch remapping system loaded", "color: #00ff00; font-weight: bold;");

// Réception des messages depuis le parent (index.html)
window.addEventListener("message", (e) => {
    const data = e.data;
    if (!data || !data.type) return;

    // Gestion keydown
    if (data.type === "keydown") {
        console.log("[MYNVO] Keydown received:", data.key, "keyCode:", data.keyCode);
        
        // Créer un événement clavier complet avec key ET keyCode
        const event = new KeyboardEvent("keydown", {
            key: data.key,
            keyCode: data.keyCode || getKeyCodeFromKey(data.key),
            code: getCodeFromKey(data.key),
            which: data.keyCode || getKeyCodeFromKey(data.key),
            bubbles: true,
            cancelable: true,
            composed: true
        });
        
        // Dispatch sur document ET window pour compatibilité Unity
        document.dispatchEvent(event);
        window.dispatchEvent(event);
        
        // Trouver le canvas Unity et dispatcher aussi dessus
        const canvas = document.querySelector("canvas");
        if (canvas) {
            canvas.dispatchEvent(event);
        }
    }

    // Gestion keyup
    if (data.type === "keyup") {
        console.log("[MYNVO] Keyup received:", data.key, "keyCode:", data.keyCode);
        
        const event = new KeyboardEvent("keyup", {
            key: data.key,
            keyCode: data.keyCode || getKeyCodeFromKey(data.key),
            code: getCodeFromKey(data.key),
            which: data.keyCode || getKeyCodeFromKey(data.key),
            bubbles: true,
            cancelable: true,
            composed: true
        });
        
        document.dispatchEvent(event);
        window.dispatchEvent(event);
        
        const canvas = document.querySelector("canvas");
        if (canvas) {
            canvas.dispatchEvent(event);
        }
    }
});

// Helper: Convertir key string en keyCode (pour compatibilité)
function getKeyCodeFromKey(key) {
    const keyCodeMap = {
        'ArrowUp': 38,
        'ArrowDown': 40,
        'ArrowLeft': 37,
        'ArrowRight': 39,
        ' ': 32,
        'Space': 32,
        'w': 87, 'W': 87,
        'a': 65, 'A': 65,
        's': 83, 'S': 83,
        'd': 68, 'D': 68,
        'z': 90, 'Z': 90,
        'q': 81, 'Q': 81
    };
    return keyCodeMap[key] || 0;
}

// Helper: Convertir key string en code (pour KeyboardEvent.code)
function getCodeFromKey(key) {
    const codeMap = {
        'ArrowUp': 'ArrowUp',
        'ArrowDown': 'ArrowDown',
        'ArrowLeft': 'ArrowLeft',
        'ArrowRight': 'ArrowRight',
        ' ': 'Space',
        'Space': 'Space',
        'w': 'KeyW', 'W': 'KeyW',
        'a': 'KeyA', 'A': 'KeyA',
        's': 'KeyS', 'S': 'KeyS',
        'd': 'KeyD', 'D': 'KeyD',
        'z': 'KeyZ', 'Z': 'KeyZ',
        'q': 'KeyQ', 'Q': 'KeyQ'
    };
    return codeMap[key] || '';
}

// Notification au parent que le loader est prêt
window.addEventListener("load", () => {
    console.log("%c[MYNVO] Game loaded and ready!", "color: #ffd700; font-weight: bold; font-size: 14px;");
    
    // Envoyer un message au parent pour confirmer le chargement
    if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: "mynvo_game_loaded" }, "*");
    }
    
    // Attendre que le canvas Unity soit créé
    const checkCanvas = setInterval(() => {
        const canvas = document.querySelector("canvas");
        if (canvas) {
            console.log("%c[MYNVO] Unity canvas detected!", "color: #00ff00; font-weight: bold;");
            clearInterval(checkCanvas);
            
            // Focus sur le canvas pour garantir la réception des événements
            canvas.setAttribute("tabindex", "1");
            canvas.focus();
            
            // Re-focus périodiquement pour éviter la perte de focus
            setInterval(() => {
                if (document.activeElement !== canvas) {
                    canvas.focus();
                }
            }, 1000);
        }
    }, 100);
});

// Debug: Logger tous les événements clavier reçus (à commenter en production)
if (window.location.href.includes("debug")) {
    document.addEventListener("keydown", (e) => {
        console.log("[DEBUG] Native keydown:", {
            key: e.key,
            keyCode: e.keyCode,
            code: e.code,
            which: e.which
        });
    });
    
    document.addEventListener("keyup", (e) => {
        console.log("[DEBUG] Native keyup:", {
            key: e.key,
            keyCode: e.keyCode,
            code: e.code,
            which: e.which
        });
    });
}

console.log("%c[MYNVO] Master loader initialized successfully ✓", "color: #58a6ff; font-weight: bold;");
