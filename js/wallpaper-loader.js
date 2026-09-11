// ============================================
// SRMS - Wallpaper Loader
// Uses Picsum Photos for reliability
// ============================================

var WALLPAPER_DATA = {
  none: {
    name: "Dark Gradient",
    icon: "fa-moon",
    type: "gradient",
    css: "linear-gradient(135deg, #0a0e27 0%, #1a1f4e 50%, #0f3460 100%)",
    category: "Default",
    credit: "SRMS Default",
  },
  library: {
    name: "Library Classic",
    icon: "fa-book",
    type: "image",
    category: "School",
  },
  classroom: {
    name: "Modern Classroom",
    icon: "fa-chalkboard",
    type: "image",
    category: "School",
  },
  bookshelf: {
    name: "Bookshelf Heaven",
    icon: "fa-layer-group",
    type: "image",
    category: "School",
  },
  graduation: {
    name: "Graduation Day",
    icon: "fa-graduation-cap",
    type: "image",
    category: "School",
  },
  lecture: {
    name: "Lecture Hall",
    icon: "fa-university",
    type: "image",
    category: "School",
  },
  computer: {
    name: "Computer Lab",
    icon: "fa-laptop",
    type: "image",
    category: "School",
  },
  science: {
    name: "Science Lab",
    icon: "fa-flask",
    type: "image",
    category: "School",
  },
  playground: {
    name: "Playground Fun",
    icon: "fa-futbol",
    type: "image",
    category: "School",
  },
  campus: {
    name: "Sunset Campus",
    icon: "fa-building",
    type: "image",
    category: "School",
  },
  studydesk: {
    name: "Study Desk",
    icon: "fa-desk",
    type: "image",
    category: "School",
  },
  artstudio: {
    name: "Art Studio",
    icon: "fa-palette",
    type: "image",
    category: "School",
  },
  music: {
    name: "Music Room",
    icon: "fa-music",
    type: "image",
    category: "School",
  },
  sports: {
    name: "Sports Field",
    icon: "fa-volleyball-ball",
    type: "image",
    category: "School",
  },
  cafeteria: {
    name: "Cafeteria",
    icon: "fa-utensils",
    type: "image",
    category: "School",
  },
  hallway: {
    name: "School Hallway",
    icon: "fa-door-open",
    type: "image",
    category: "School",
  },
  lockers: {
    name: "School Lockers",
    icon: "fa-archive",
    type: "image",
    category: "School",
  },
  reading: {
    name: "Reading Corner",
    icon: "fa-book-reader",
    type: "image",
    category: "School",
  },
  studygroup: {
    name: "Study Group",
    icon: "fa-users",
    type: "image",
    category: "School",
  },
  notebook: {
    name: "Notebook",
    icon: "fa-pen",
    type: "image",
    category: "School",
  },
  pencils: {
    name: "Colored Pencils",
    icon: "fa-paint-brush",
    type: "image",
    category: "School",
  },
  globe: {
    name: "Globe Map",
    icon: "fa-globe-africa",
    type: "image",
    category: "School",
  },
  microscope: {
    name: "Microscope",
    icon: "fa-microscope",
    type: "image",
    category: "School",
  },
  math: {
    name: "Math Blackboard",
    icon: "fa-square-root-alt",
    type: "image",
    category: "School",
  },
  chemistry: {
    name: "Chemistry",
    icon: "fa-vial",
    type: "image",
    category: "School",
  },
  physics: {
    name: "Physics",
    icon: "fa-atom",
    type: "image",
    category: "School",
  },
  biology: {
    name: "Biology",
    icon: "fa-dna",
    type: "image",
    category: "School",
  },
  geography: {
    name: "Geography",
    icon: "fa-globe",
    type: "image",
    category: "School",
  },
  ocean: {
    name: "Ocean View",
    icon: "fa-water",
    type: "image",
    category: "Nature",
  },
  forest: {
    name: "Forest Path",
    icon: "fa-tree",
    type: "image",
    category: "Nature",
  },
  mountain: {
    name: "Mountain Peak",
    icon: "fa-mountain",
    type: "image",
    category: "Nature",
  },
  galaxy: {
    name: "Galaxy Stars",
    icon: "fa-star",
    type: "image",
    category: "Nature",
  },
  cherryblossom: {
    name: "Cherry Blossom",
    icon: "fa-seedling",
    type: "image",
    category: "Nature",
  },
  northernlights: {
    name: "Northern Lights",
    icon: "fa-bolt",
    type: "image",
    category: "Nature",
  },
  autumn: {
    name: "Autumn Leaves",
    icon: "fa-leaf",
    type: "image",
    category: "Nature",
  },
  winter: {
    name: "Winter Snow",
    icon: "fa-snowflake",
    type: "image",
    category: "Nature",
  },
  spring: {
    name: "Spring Flowers",
    icon: "fa-flower",
    type: "image",
    category: "Nature",
  },
  summer: {
    name: "Summer Beach",
    icon: "fa-umbrella-beach",
    type: "image",
    category: "Nature",
  },
  rainy: {
    name: "Rainy Window",
    icon: "fa-cloud-rain",
    type: "image",
    category: "Nature",
  },
  starry: {
    name: "Starry Night",
    icon: "fa-moon",
    type: "image",
    category: "Nature",
  },
  goldenhour: {
    name: "Golden Hour",
    icon: "fa-sun",
    type: "image",
    category: "Nature",
  },
  lavender: {
    name: "Lavender Field",
    icon: "fa-spa",
    type: "image",
    category: "Nature",
  },
  sunflower: {
    name: "Sunflower Field",
    icon: "fa-sun",
    type: "image",
    category: "Nature",
  },
  rose: {
    name: "Rose Garden",
    icon: "fa-heart",
    type: "image",
    category: "Nature",
  },
  tulip: {
    name: "Tulip Field",
    icon: "fa-flower",
    type: "image",
    category: "Nature",
  },
  zen: {
    name: "Zen Garden",
    icon: "fa-peace",
    type: "image",
    category: "Nature",
  },
  greennature: {
    name: "Green Nature",
    icon: "fa-seedling",
    type: "image",
    category: "Nature",
  },
  sunrise: {
    name: "Sunrise",
    icon: "fa-sun",
    type: "image",
    category: "Nature",
  },
  citynight: {
    name: "City Lights",
    icon: "fa-city",
    type: "image",
    category: "City",
  },
  architecture: {
    name: "Architecture",
    icon: "fa-landmark",
    type: "image",
    category: "City",
  },
  castle: {
    name: "Castle",
    icon: "fa-chess-rook",
    type: "image",
    category: "City",
  },
  cathedral: {
    name: "Cathedral",
    icon: "fa-church",
    type: "image",
    category: "City",
  },
  bridge: {
    name: "Bridge",
    icon: "fa-archway",
    type: "image",
    category: "City",
  },
  lighthouse: {
    name: "Lighthouse",
    icon: "fa-lightbulb",
    type: "image",
    category: "City",
  },
  windmill: {
    name: "Windmill",
    icon: "fa-wind",
    type: "image",
    category: "City",
  },
  balloon: {
    name: "Hot Air Balloon",
    icon: "fa-parachute-box",
    type: "image",
    category: "City",
  },
  abstract: {
    name: "Abstract Art",
    icon: "fa-paint-brush",
    type: "image",
    category: "Abstract",
  },
  geometric: {
    name: "Geometric",
    icon: "fa-shapes",
    type: "image",
    category: "Abstract",
  },
  minimalist: {
    name: "Minimalist",
    icon: "fa-circle",
    type: "image",
    category: "Abstract",
  },
  blueabstract: {
    name: "Blue Abstract",
    icon: "fa-water",
    type: "image",
    category: "Abstract",
  },
  purple: {
    name: "Purple Haze",
    icon: "fa-feather",
    type: "image",
    category: "Abstract",
  },
  technology: {
    name: "Technology",
    icon: "fa-microchip",
    type: "image",
    category: "Abstract",
  },
  knowledge: {
    name: "Knowledge",
    icon: "fa-book-open",
    type: "image",
    category: "Abstract",
  },
  success: {
    name: "Success Path",
    icon: "fa-trophy",
    type: "image",
    category: "Abstract",
  },
};

function buildPicsumFullUrl(seed) {
  return (
    "https://picsum.photos/seed/" + encodeURIComponent(seed) + "/1920/1080"
  );
}

function applyWallpaper(key) {
  var wallpaper = WALLPAPER_DATA[key] || WALLPAPER_DATA["library"];
  if (!wallpaper) return;

  var body = document.body;
  if (wallpaper.type === "gradient") {
    body.style.background = wallpaper.css;
    body.style.backgroundImage = "none";
    body.style.backgroundAttachment = "fixed";
  } else {
    var url = buildPicsumFullUrl(key);
    body.style.background =
      'linear-gradient(rgba(10, 14, 39, 0.6), rgba(10, 14, 39, 0.7)), url("' +
      url +
      '")';
    body.style.backgroundSize = "cover";
    body.style.backgroundPosition = "center";
    body.style.backgroundAttachment = "fixed";
    body.style.backgroundRepeat = "no-repeat";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  var savedWallpaper = localStorage.getItem("srms_wallpaper") || "library";
  applyWallpaper(savedWallpaper);
});

// Apply immediately (before DOM ready) to avoid flash
(function () {
  var savedWallpaper = localStorage.getItem("srms_wallpaper") || "library";
  var wallpaper = WALLPAPER_DATA[savedWallpaper];
  if (wallpaper && wallpaper.type !== "gradient") {
    var url = buildPicsumFullUrl(savedWallpaper);
    document.body.style.background =
      'linear-gradient(rgba(10, 14, 39, 0.6), rgba(10, 14, 39, 0.7)), url("' +
      url +
      '")';
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundAttachment = "fixed";
    document.body.style.backgroundRepeat = "no-repeat";
  } else if (wallpaper && wallpaper.type === "gradient") {
    document.body.style.background = wallpaper.css;
  }
})();

window.WALLPAPER_DATA = WALLPAPER_DATA;
window.applyWallpaper = applyWallpaper;
window.buildPicsumFullUrl = buildPicsumFullUrl;

console.log(
  "✅ Wallpaper Loader ready (Picsum) — " +
    Object.keys(WALLPAPER_DATA).length +
    " wallpapers",
);
