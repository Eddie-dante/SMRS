// ============================================
// SRMS - Wallpaper Loader (Curated Real Images)
// Uses specific Unsplash photo IDs matched to names
// + dedicated fixed <div> behind everything
// ============================================

var WALLPAPER_DATA = {
  none: {
    name: "Dark Gradient",
    icon: "fa-moon",
    type: "gradient",
    css: "linear-gradient(135deg, #0a0e27 0%, #1a1f4e 50%, #0f3460 100%)",
    category: "Default",
  },

  // ===== SCHOOL =====
  library: {
    name: "Library Classic",
    icon: "fa-book",
    type: "image",
    category: "School",
    url: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1920&q=80&auto=format&fit=crop",
  },
  classroom: {
    name: "Modern Classroom",
    icon: "fa-chalkboard",
    type: "image",
    category: "School",
    url: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1920&q=80&auto=format&fit=crop",
  },
  bookshelf: {
    name: "Bookshelf Heaven",
    icon: "fa-layer-group",
    type: "image",
    category: "School",
    url: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1920&q=80&auto=format&fit=crop",
  },
  graduation: {
    name: "Graduation Day",
    icon: "fa-graduation-cap",
    type: "image",
    category: "School",
    url: "https://images.unsplash.com/photo-1523050854058-8df90910f68e?w=1920&q=80&auto=format&fit=crop",
  },
  lecture: {
    name: "Lecture Hall",
    icon: "fa-university",
    type: "image",
    category: "School",
    url: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=1920&q=80&auto=format&fit=crop",
  },
  computer: {
    name: "Computer Lab",
    icon: "fa-laptop",
    type: "image",
    category: "School",
    url: "https://images.unsplash.com/photo-1571266028243-e4c84c8a40b7?w=1920&q=80&auto=format&fit=crop",
  },
  science: {
    name: "Science Lab",
    icon: "fa-flask",
    type: "image",
    category: "School",
    url: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1920&q=80&auto=format&fit=crop",
  },
  playground: {
    name: "Playground Fun",
    icon: "fa-futbol",
    type: "image",
    category: "School",
    url: "https://images.unsplash.com/photo-1472898965229-f9b06b9c9bbe?w=1920&q=80&auto=format&fit=crop",
  },
  campus: {
    name: "Sunset Campus",
    icon: "fa-building",
    type: "image",
    category: "School",
    url: "https://images.unsplash.com/photo-1562774053-701939374585?w=1920&q=80&auto=format&fit=crop",
  },
  studydesk: {
    name: "Study Desk",
    icon: "fa-desk",
    type: "image",
    category: "School",
    url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1920&q=80&auto=format&fit=crop",
  },
  artstudio: {
    name: "Art Studio",
    icon: "fa-palette",
    type: "image",
    category: "School",
    url: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1920&q=80&auto=format&fit=crop",
  },
  music: {
    name: "Music Room",
    icon: "fa-music",
    type: "image",
    category: "School",
    url: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1920&q=80&auto=format&fit=crop",
  },
  sports: {
    name: "Sports Field",
    icon: "fa-volleyball-ball",
    type: "image",
    category: "School",
    url: "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=1920&q=80&auto=format&fit=crop",
  },
  cafeteria: {
    name: "Cafeteria",
    icon: "fa-utensils",
    type: "image",
    category: "School",
    url: "https://images.unsplash.com/photo-1567521464027-f127ff144326?w=1920&q=80&auto=format&fit=crop",
  },
  hallway: {
    name: "School Hallway",
    icon: "fa-door-open",
    type: "image",
    category: "School",
    url: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1920&q=80&auto=format&fit=crop",
  },
  lockers: {
    name: "School Lockers",
    icon: "fa-archive",
    type: "image",
    category: "School",
    url: "https://images.unsplash.com/photo-1588072432836-e10032774350?w=1920&q=80&auto=format&fit=crop",
  },
  reading: {
    name: "Reading Corner",
    icon: "fa-book-reader",
    type: "image",
    category: "School",
    url: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1920&q=80&auto=format&fit=crop",
  },
  studygroup: {
    name: "Study Group",
    icon: "fa-users",
    type: "image",
    category: "School",
    url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1920&q=80&auto=format&fit=crop",
  },
  notebook: {
    name: "Notebook",
    icon: "fa-pen",
    type: "image",
    category: "School",
    url: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=1920&q=80&auto=format&fit=crop",
  },
  pencils: {
    name: "Colored Pencils",
    icon: "fa-paint-brush",
    type: "image",
    category: "School",
    url: "https://images.unsplash.com/photo-1503602642458-232111445657?w=1920&q=80&auto=format&fit=crop",
  },
  globe: {
    name: "Globe Map",
    icon: "fa-globe-africa",
    type: "image",
    category: "School",
    url: "https://images.unsplash.com/photo-1524666643752-b381eb00effb?w=1920&q=80&auto=format&fit=crop",
  },
  microscope: {
    name: "Microscope",
    icon: "fa-microscope",
    type: "image",
    category: "School",
    url: "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=1920&q=80&auto=format&fit=crop",
  },
  math: {
    name: "Math Blackboard",
    icon: "fa-square-root-alt",
    type: "image",
    category: "School",
    url: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1920&q=80&auto=format&fit=crop",
  },
  chemistry: {
    name: "Chemistry",
    icon: "fa-vial",
    type: "image",
    category: "School",
    url: "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=1920&q=80&auto=format&fit=crop",
  },
  physics: {
    name: "Physics",
    icon: "fa-atom",
    type: "image",
    category: "School",
    url: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=1920&q=80&auto=format&fit=crop",
  },
  biology: {
    name: "Biology",
    icon: "fa-dna",
    type: "image",
    category: "School",
    url: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=1920&q=80&auto=format&fit=crop",
  },
  geography: {
    name: "Geography",
    icon: "fa-globe",
    type: "image",
    category: "School",
    url: "https://images.unsplash.com/photo-1526495124232-a04e1849168c?w=1920&q=80&auto=format&fit=crop",
  },

  // ===== NATURE =====
  ocean: {
    name: "Ocean View",
    icon: "fa-water",
    type: "image",
    category: "Nature",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80&auto=format&fit=crop",
  },
  forest: {
    name: "Forest Path",
    icon: "fa-tree",
    type: "image",
    category: "Nature",
    url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=80&auto=format&fit=crop",
  },
  mountain: {
    name: "Mountain Peak",
    icon: "fa-mountain",
    type: "image",
    category: "Nature",
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80&auto=format&fit=crop",
  },
  galaxy: {
    name: "Galaxy Stars",
    icon: "fa-star",
    type: "image",
    category: "Nature",
    url: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1920&q=80&auto=format&fit=crop",
  },
  cherryblossom: {
    name: "Cherry Blossom",
    icon: "fa-seedling",
    type: "image",
    category: "Nature",
    url: "https://images.unsplash.com/photo-1522383225653-ed111181a951?w=1920&q=80&auto=format&fit=crop",
  },
  northernlights: {
    name: "Northern Lights",
    icon: "fa-bolt",
    type: "image",
    category: "Nature",
    url: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1920&q=80&auto=format&fit=crop",
  },
  autumn: {
    name: "Autumn Leaves",
    icon: "fa-leaf",
    type: "image",
    category: "Nature",
    url: "https://images.unsplash.com/photo-1507371341162-763b5e419408?w=1920&q=80&auto=format&fit=crop",
  },
  winter: {
    name: "Winter Snow",
    icon: "fa-snowflake",
    type: "image",
    category: "Nature",
    url: "https://images.unsplash.com/photo-1477601263568-180e2c6d046e?w=1920&q=80&auto=format&fit=crop",
  },
  spring: {
    name: "Spring Flowers",
    icon: "fa-flower",
    type: "image",
    category: "Nature",
    url: "https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=1920&q=80&auto=format&fit=crop",
  },
  summer: {
    name: "Summer Beach",
    icon: "fa-umbrella-beach",
    type: "image",
    category: "Nature",
    url: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1920&q=80&auto=format&fit=crop",
  },
  rainy: {
    name: "Rainy Window",
    icon: "fa-cloud-rain",
    type: "image",
    category: "Nature",
    url: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=1920&q=80&auto=format&fit=crop",
  },
  starry: {
    name: "Starry Night",
    icon: "fa-moon",
    type: "image",
    category: "Nature",
    url: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&q=80&auto=format&fit=crop",
  },
  goldenhour: {
    name: "Golden Hour",
    icon: "fa-sun",
    type: "image",
    category: "Nature",
    url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&q=80&auto=format&fit=crop",
  },
  lavender: {
    name: "Lavender Field",
    icon: "fa-spa",
    type: "image",
    category: "Nature",
    url: "https://images.unsplash.com/photo-1499002238440-d264edd596ec?w=1920&q=80&auto=format&fit=crop",
  },
  sunflower: {
    name: "Sunflower Field",
    icon: "fa-sun",
    type: "image",
    category: "Nature",
    url: "https://images.unsplash.com/photo-1470509037663-253afd7f0f51?w=1920&q=80&auto=format&fit=crop",
  },
  rose: {
    name: "Rose Garden",
    icon: "fa-heart",
    type: "image",
    category: "Nature",
    url: "https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=1920&q=80&auto=format&fit=crop",
  },
  tulip: {
    name: "Tulip Field",
    icon: "fa-flower",
    type: "image",
    category: "Nature",
    url: "https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?w=1920&q=80&auto=format&fit=crop",
  },
  zen: {
    name: "Zen Garden",
    icon: "fa-peace",
    type: "image",
    category: "Nature",
    url: "https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=1920&q=80&auto=format&fit=crop",
  },
  greennature: {
    name: "Green Nature",
    icon: "fa-seedling",
    type: "image",
    category: "Nature",
    url: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=1920&q=80&auto=format&fit=crop",
  },
  sunrise: {
    name: "Sunrise",
    icon: "fa-sun",
    type: "image",
    category: "Nature",
    url: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=1920&q=80&auto=format&fit=crop",
  },

  // ===== CITY =====
  citynight: {
    name: "City Lights",
    icon: "fa-city",
    type: "image",
    category: "City",
    url: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1920&q=80&auto=format&fit=crop",
  },
  architecture: {
    name: "Architecture",
    icon: "fa-landmark",
    type: "image",
    category: "City",
    url: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1920&q=80&auto=format&fit=crop",
  },
  castle: {
    name: "Castle",
    icon: "fa-chess-rook",
    type: "image",
    category: "City",
    url: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1920&q=80&auto=format&fit=crop",
  },
  cathedral: {
    name: "Cathedral",
    icon: "fa-church",
    type: "image",
    category: "City",
    url: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1920&q=80&auto=format&fit=crop",
  },
  bridge: {
    name: "Bridge",
    icon: "fa-archway",
    type: "image",
    category: "City",
    url: "https://images.unsplash.com/photo-1494522855154-9297ac14b55f?w=1920&q=80&auto=format&fit=crop",
  },
  lighthouse: {
    name: "Lighthouse",
    icon: "fa-lightbulb",
    type: "image",
    category: "City",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&q=80&auto=format&fit=crop",
  },
  windmill: {
    name: "Windmill",
    icon: "fa-wind",
    type: "image",
    category: "City",
    url: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=1920&q=80&auto=format&fit=crop",
  },
  balloon: {
    name: "Hot Air Balloon",
    icon: "fa-parachute-box",
    type: "image",
    category: "City",
    url: "https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?w=1920&q=80&auto=format&fit=crop",
  },

  // ===== ABSTRACT =====
  abstract: {
    name: "Abstract Art",
    icon: "fa-paint-brush",
    type: "image",
    category: "Abstract",
    url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1920&q=80&auto=format&fit=crop",
  },
  geometric: {
    name: "Geometric",
    icon: "fa-shapes",
    type: "image",
    category: "Abstract",
    url: "https://images.unsplash.com/photo-1550859492-d5da9d8e45f3?w=1920&q=80&auto=format&fit=crop",
  },
  minimalist: {
    name: "Minimalist",
    icon: "fa-circle",
    type: "image",
    category: "Abstract",
    url: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1920&q=80&auto=format&fit=crop",
  },
  blueabstract: {
    name: "Blue Abstract",
    icon: "fa-water",
    type: "image",
    category: "Abstract",
    url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1920&q=80&auto=format&fit=crop",
  },
  purple: {
    name: "Purple Haze",
    icon: "fa-feather",
    type: "image",
    category: "Abstract",
    url: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=1920&q=80&auto=format&fit=crop",
  },
  technology: {
    name: "Technology",
    icon: "fa-microchip",
    type: "image",
    category: "Abstract",
    url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1920&q=80&auto=format&fit=crop",
  },
  knowledge: {
    name: "Knowledge",
    icon: "fa-book-open",
    type: "image",
    category: "Abstract",
    url: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1920&q=80&auto=format&fit=crop",
  },
  success: {
    name: "Success Path",
    icon: "fa-trophy",
    type: "image",
    category: "Abstract",
    url: "https://images.unsplash.com/photo-1494178270175-e96de2971df9?w=1920&q=80&auto=format&fit=crop",
  },
};

function buildImageUrl(key, width) {
  var w = width || 1920;
  var wallpaper = WALLPAPER_DATA[key];
  if (!wallpaper || !wallpaper.url) return null;
  return wallpaper.url.replace(/w=\d+/, "w=" + w);
}

function ensureBackgroundLayer() {
  var el = document.getElementById("srms-wallpaper-bg");
  if (el) return el;

  el = document.createElement("div");
  el.id = "srms-wallpaper-bg";
  el.style.cssText =
    "position:fixed;" +
    "top:0;left:0;right:0;bottom:0;" +
    "width:100vw;height:100vh;" +
    "z-index:-1;" +
    "pointer-events:none;" +
    "background-size:cover;" +
    "background-position:center;" +
    "background-repeat:no-repeat;" +
    "background-attachment:fixed;" +
    "transition:background-image 0.6s ease, background 0.6s ease;";

  if (document.body) {
    document.body.insertBefore(el, document.body.firstChild);
  } else {
    document.addEventListener("DOMContentLoaded", function () {
      document.body.insertBefore(el, document.body.firstChild);
    });
  }
  return el;
}

function transparentizeBody() {
  document.documentElement.style.background = "#05070f";
  if (document.body) {
    document.body.style.background = "transparent";
    document.body.style.backgroundImage = "none";
  }
}

function applyWallpaper(key, opts) {
  opts = opts || {};
  var wallpaper = WALLPAPER_DATA[key] || WALLPAPER_DATA["library"];
  if (!wallpaper) return;

  // Always ensure the layer exists + body is transparent
  var layer = ensureBackgroundLayer();
  transparentizeBody();

  // Preload the image BEFORE swapping, so there's no flash
  var proceed = function () {
    if (wallpaper.type === "gradient") {
      layer.style.backgroundImage = wallpaper.css;
      layer.style.background = wallpaper.css;
      layer.style.backgroundSize = "";
      layer.style.backgroundPosition = "";
      layer.style.backgroundRepeat = "";
      layer.style.backgroundAttachment = "";
    } else {
      var url = buildImageUrl(key, 1920);
      layer.style.background =
        'linear-gradient(rgba(8, 12, 28, 0.55), rgba(8, 12, 28, 0.68)), url("' +
        url +
        '")';
      layer.style.backgroundSize = "cover";
      layer.style.backgroundPosition = "center";
      layer.style.backgroundRepeat = "no-repeat";
      layer.style.backgroundAttachment = "fixed";
    }
    if (opts.silent !== true && typeof showNotification === "function") {
      showNotification("Wallpaper applied", "success");
    }
  };

  if (wallpaper.type === "gradient") {
    proceed();
  } else {
    // Preload to avoid flicker
    var img = new Image();
    img.onload = proceed;
    img.onerror = proceed;
    img.src = buildImageUrl(key, 1920);
  }
}

function setupBaseStyles() {
  var styleId = "srms-wallpaper-base-style";
  if (document.getElementById(styleId)) return;
  var style = document.createElement("style");
  style.id = styleId;
  style.textContent =
    "html { background: #05070f !important; }" +
    "body { background: transparent !important; background-image: none !important; }" +
    "#srms-wallpaper-bg { z-index: -1 !important; }" +
    ".taskbar, .floating-navbar-container, .main-content, .modal, .notification { position: relative; z-index: 1; }" +
    ".taskbar { z-index: 1000 !important; }" +
    ".floating-navbar-container { z-index: 1000 !important; }" +
    ".modal { z-index: 1300 !important; }" +
    ".notification { z-index: 2000 !important; }";
  document.head.appendChild(style);
}

// Runs immediately, before DOM ready
setupBaseStyles();
ensureBackgroundLayer();
transparentizeBody();

document.addEventListener("DOMContentLoaded", function () {
  setupBaseStyles();
  var savedWallpaper = localStorage.getItem("srms_wallpaper") || "library";
  applyWallpaper(savedWallpaper, { silent: true });
});

// Watchdog: if body got replaced somehow, re-inject
var layerWatch = setInterval(function () {
  if (document.body && !document.getElementById("srms-wallpaper-bg")) {
    ensureBackgroundLayer();
    transparentizeBody();
    var saved = localStorage.getItem("srms_wallpaper") || "library";
    applyWallpaper(saved, { silent: true });
  }
}, 2000);

window.WALLPAPER_DATA = WALLPAPER_DATA;
window.applyWallpaper = applyWallpaper;
window.buildImageUrl = buildImageUrl;

console.log(
  "✅ Wallpaper Loader ready (curated images) — " +
    Object.keys(WALLPAPER_DATA).length +
    " wallpapers",
);
