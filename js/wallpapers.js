// ============================================
// SRMS - Complete Wallpaper Management System
// Full Version
// ============================================

var WALLPAPERS = {
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
    url: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1920&q=80&auto=format&fit=crop",
    category: "School",
    credit: "Susan Q Yin",
  },
  classroom: {
    name: "Modern Classroom",
    icon: "fa-chalkboard",
    type: "image",
    url: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1920&q=80&auto=format&fit=crop",
    category: "School",
    credit: "Nguyen Dang Hoang Nhu",
  },
  bookshelf: {
    name: "Bookshelf Heaven",
    icon: "fa-layer-group",
    type: "image",
    url: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1920&q=80&auto=format&fit=crop",
    category: "School",
    credit: "Giammarco Boscaro",
  },
  graduation: {
    name: "Graduation Day",
    icon: "fa-graduation-cap",
    type: "image",
    url: "https://images.unsplash.com/photo-1523050854058-8df90910f68e?w=1920&q=80&auto=format&fit=crop",
    category: "School",
    credit: "Vasily Koloda",
  },
  lecture: {
    name: "Lecture Hall",
    icon: "fa-university",
    type: "image",
    url: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=1920&q=80&auto=format&fit=crop",
    category: "School",
    credit: "Dom Fou",
  },
  computer: {
    name: "Computer Lab",
    icon: "fa-laptop",
    type: "image",
    url: "https://images.unsplash.com/photo-1571266028243-e4c84c8a40b7?w=1920&q=80&auto=format&fit=crop",
    category: "School",
    credit: "John Schnobrich",
  },
  science: {
    name: "Science Lab",
    icon: "fa-flask",
    type: "image",
    url: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1920&q=80&auto=format&fit=crop",
    category: "School",
    credit: "Hans Reniers",
  },
  playground: {
    name: "Playground Fun",
    icon: "fa-futbol",
    type: "image",
    url: "https://images.unsplash.com/photo-1472898965229-f9b06b9c9bbe?w=1920&q=80&auto=format&fit=crop",
    category: "School",
    credit: "Mi Pham",
  },
  campus: {
    name: "Sunset Campus",
    icon: "fa-building",
    type: "image",
    url: "https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=1920&q=80&auto=format&fit=crop",
    category: "School",
    credit: "Vasily Koloda",
  },
  studydesk: {
    name: "Study Desk",
    icon: "fa-desk",
    type: "image",
    url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1920&q=80&auto=format&fit=crop",
    category: "School",
    credit: "Green Chameleon",
  },
  artstudio: {
    name: "Art Studio",
    icon: "fa-palette",
    type: "image",
    url: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1920&q=80&auto=format&fit=crop",
    category: "School",
    credit: "Alice Dietrich",
  },
  music: {
    name: "Music Room",
    icon: "fa-music",
    type: "image",
    url: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1920&q=80&auto=format&fit=crop",
    category: "School",
    credit: "Wes Hicks",
  },
  sports: {
    name: "Sports Field",
    icon: "fa-volleyball-ball",
    type: "image",
    url: "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=1920&q=80&auto=format&fit=crop",
    category: "School",
    credit: "Ben Hershey",
  },
  cafeteria: {
    name: "Cafeteria",
    icon: "fa-utensils",
    type: "image",
    url: "https://images.unsplash.com/photo-1574482620811-1aa16ffe3c82?w=1920&q=80&auto=format&fit=crop",
    category: "School",
    credit: "Dan Gold",
  },
  hallway: {
    name: "School Hallway",
    icon: "fa-door-open",
    type: "image",
    url: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1920&q=80&auto=format&fit=crop",
    category: "School",
    credit: "Taylor Flowe",
  },
  lockers: {
    name: "School Lockers",
    icon: "fa-archive",
    type: "image",
    url: "https://images.unsplash.com/photo-1588072432836-e10032774350?w=1920&q=80&auto=format&fit=crop",
    category: "School",
    credit: "Taylor Flowe",
  },
  reading: {
    name: "Reading Corner",
    icon: "fa-book-reader",
    type: "image",
    url: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1920&q=80&auto=format&fit=crop",
    category: "School",
    credit: "Ben White",
  },
  studygroup: {
    name: "Study Group",
    icon: "fa-users",
    type: "image",
    url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1920&q=80&auto=format&fit=crop",
    category: "School",
    credit: "Annie Spratt",
  },
  notebook: {
    name: "Notebook",
    icon: "fa-pen",
    type: "image",
    url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1920&q=80&auto=format&fit=crop",
    category: "School",
    credit: "Green Chameleon",
  },
  pencils: {
    name: "Colored Pencils",
    icon: "fa-paint-brush",
    type: "image",
    url: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1920&q=80&auto=format&fit=crop",
    category: "School",
    credit: "Alice Dietrich",
  },
  globe: {
    name: "Globe Map",
    icon: "fa-globe-africa",
    type: "image",
    url: "https://images.unsplash.com/photo-1524666643752-b381eb00effb?w=1920&q=80&auto=format&fit=crop",
    category: "School",
    credit: "Kyle Glenn",
  },
  microscope: {
    name: "Microscope",
    icon: "fa-microscope",
    type: "image",
    url: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1920&q=80&auto=format&fit=crop",
    category: "School",
    credit: "Hans Reniers",
  },
  math: {
    name: "Math Blackboard",
    icon: "fa-square-root-alt",
    type: "image",
    url: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1920&q=80&auto=format&fit=crop",
    category: "School",
    credit: "Jeswin Thomas",
  },
  chemistry: {
    name: "Chemistry",
    icon: "fa-vial",
    type: "image",
    url: "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=1920&q=80&auto=format&fit=crop",
    category: "School",
    credit: "Alex Kondratiev",
  },
  physics: {
    name: "Physics",
    icon: "fa-atom",
    type: "image",
    url: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=1920&q=80&auto=format&fit=crop",
    category: "School",
    credit: "Hal Gatewood",
  },
  biology: {
    name: "Biology",
    icon: "fa-dna",
    type: "image",
    url: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=1920&q=80&auto=format&fit=crop",
    category: "School",
    credit: "National Cancer Institute",
  },
  geography: {
    name: "Geography",
    icon: "fa-globe",
    type: "image",
    url: "https://images.unsplash.com/photo-1526495124232-a04e1849168c?w=1920&q=80&auto=format&fit=crop",
    category: "School",
    credit: "USGS",
  },
  ocean: {
    name: "Ocean View",
    icon: "fa-water",
    type: "image",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80&auto=format&fit=crop",
    category: "Nature",
    credit: "Sean Oulashin",
  },
  forest: {
    name: "Forest Path",
    icon: "fa-tree",
    type: "image",
    url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=80&auto=format&fit=crop",
    category: "Nature",
    credit: "Lukasz Szmigiel",
  },
  mountain: {
    name: "Mountain Peak",
    icon: "fa-mountain",
    type: "image",
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80&auto=format&fit=crop",
    category: "Nature",
    credit: "Bailey Zindel",
  },
  galaxy: {
    name: "Galaxy Stars",
    icon: "fa-star",
    type: "image",
    url: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1920&q=80&auto=format&fit=crop",
    category: "Nature",
    credit: "Guillermo Ferla",
  },
  cherryblossom: {
    name: "Cherry Blossom",
    icon: "fa-seedling",
    type: "image",
    url: "https://images.unsplash.com/photo-1522383225653-ed111181a951?w=1920&q=80&auto=format&fit=crop",
    category: "Nature",
    credit: "AJ",
  },
  northernlights: {
    name: "Northern Lights",
    icon: "fa-bolt",
    type: "image",
    url: "https://images.unsplash.com/photo-1483347756197-71ef80e95f73?w=1920&q=80&auto=format&fit=crop",
    category: "Nature",
    credit: "Vincent Guth",
  },
  autumn: {
    name: "Autumn Leaves",
    icon: "fa-leaf",
    type: "image",
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80&auto=format&fit=crop",
    category: "Nature",
    credit: "Bailey Zindel",
  },
  winter: {
    name: "Winter Snow",
    icon: "fa-snowflake",
    type: "image",
    url: "https://images.unsplash.com/photo-1477601263568-180e2c6d046e?w=1920&q=80&auto=format&fit=crop",
    category: "Nature",
    credit: "Aaron Burden",
  },
  spring: {
    name: "Spring Flowers",
    icon: "fa-flower",
    type: "image",
    url: "https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=1920&q=80&auto=format&fit=crop",
    category: "Nature",
    credit: "Jen Theodore",
  },
  summer: {
    name: "Summer Beach",
    icon: "fa-umbrella-beach",
    type: "image",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80&auto=format&fit=crop",
    category: "Nature",
    credit: "Sean Oulashin",
  },
  rainy: {
    name: "Rainy Window",
    icon: "fa-cloud-rain",
    type: "image",
    url: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=1920&q=80&auto=format&fit=crop",
    category: "Nature",
    credit: "Maksym Kaharlytskyi",
  },
  starry: {
    name: "Starry Night",
    icon: "fa-moon",
    type: "image",
    url: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&q=80&auto=format&fit=crop",
    category: "Nature",
    credit: "Vincentiu Solomon",
  },
  goldenhour: {
    name: "Golden Hour",
    icon: "fa-sun",
    type: "image",
    url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&q=80&auto=format&fit=crop",
    category: "Nature",
    credit: "Johannes Plenio",
  },
  lavender: {
    name: "Lavender Field",
    icon: "fa-spa",
    type: "image",
    url: "https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=1920&q=80&auto=format&fit=crop",
    category: "Nature",
    credit: "Jen Theodore",
  },
  sunflower: {
    name: "Sunflower Field",
    icon: "fa-sunflower",
    type: "image",
    url: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1920&q=80&auto=format&fit=crop",
    category: "Nature",
    credit: "Lukasz Szmigiel",
  },
  rose: {
    name: "Rose Garden",
    icon: "fa-rose",
    type: "image",
    url: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1920&q=80&auto=format&fit=crop",
    category: "Nature",
    credit: "Annie Spratt",
  },
  tulip: {
    name: "Tulip Field",
    icon: "fa-flower",
    type: "image",
    url: "https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=1920&q=80&auto=format&fit=crop",
    category: "Nature",
    credit: "Jen Theodore",
  },
  zen: {
    name: "Zen Garden",
    icon: "fa-peace",
    type: "image",
    url: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1920&q=80&auto=format&fit=crop",
    category: "Nature",
    credit: "Annie Spratt",
  },
  greennature: {
    name: "Green Nature",
    icon: "fa-seedling",
    type: "image",
    url: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1920&q=80&auto=format&fit=crop",
    category: "Nature",
    credit: "Lukasz Szmigiel",
  },
  sunrise: {
    name: "Sunrise",
    icon: "fa-sun",
    type: "image",
    url: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=1920&q=80&auto=format&fit=crop",
    category: "Nature",
    credit: "Bailey Zindel",
  },
  citynight: {
    name: "City Lights",
    icon: "fa-city",
    type: "image",
    url: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1920&q=80&auto=format&fit=crop",
    category: "City",
    credit: "Pedro Lastra",
  },
  architecture: {
    name: "Architecture",
    icon: "fa-landmark",
    type: "image",
    url: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1920&q=80&auto=format&fit=crop",
    category: "City",
    credit: "Patrick Tomasso",
  },
  castle: {
    name: "Castle",
    icon: "fa-chess-rook",
    type: "image",
    url: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1920&q=80&auto=format&fit=crop",
    category: "City",
    credit: "Anna Church",
  },
  cathedral: {
    name: "Cathedral",
    icon: "fa-church",
    type: "image",
    url: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1920&q=80&auto=format&fit=crop",
    category: "City",
    credit: "Chris Karidis",
  },
  bridge: {
    name: "Bridge",
    icon: "fa-bridge",
    type: "image",
    url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=80&auto=format&fit=crop",
    category: "City",
    credit: "Lukasz Szmigiel",
  },
  lighthouse: {
    name: "Lighthouse",
    icon: "fa-lightbulb",
    type: "image",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80&auto=format&fit=crop",
    category: "City",
    credit: "Sean Oulashin",
  },
  windmill: {
    name: "Windmill",
    icon: "fa-wind",
    type: "image",
    url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&q=80&auto=format&fit=crop",
    category: "City",
    credit: "Johannes Plenio",
  },
  balloon: {
    name: "Hot Air Balloon",
    icon: "fa-balloon",
    type: "image",
    url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&q=80&auto=format&fit=crop",
    category: "City",
    credit: "Johannes Plenio",
  },
  abstract: {
    name: "Abstract Art",
    icon: "fa-paint-brush",
    type: "image",
    url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1920&q=80&auto=format&fit=crop",
    category: "Abstract",
    credit: "Pawel Czerwinski",
  },
  geometric: {
    name: "Geometric",
    icon: "fa-shapes",
    type: "image",
    url: "https://images.unsplash.com/photo-1550859492-d5da9d8e45f3?w=1920&q=80&auto=format&fit=crop",
    category: "Abstract",
    credit: "Ricardo Gomez Angel",
  },
  minimalist: {
    name: "Minimalist",
    icon: "fa-circle",
    type: "image",
    url: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1920&q=80&auto=format&fit=crop",
    category: "Abstract",
    credit: "Bench Accounting",
  },
  blueabstract: {
    name: "Blue Abstract",
    icon: "fa-wave",
    type: "image",
    url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1920&q=80&auto=format&fit=crop",
    category: "Abstract",
    credit: "Pawel Czerwinski",
  },
  purple: {
    name: "Purple Haze",
    icon: "fa-feather",
    type: "image",
    url: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=1920&q=80&auto=format&fit=crop",
    category: "Abstract",
    credit: "Milad Fakurian",
  },
  technology: {
    name: "Technology",
    icon: "fa-microchip",
    type: "image",
    url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1920&q=80&auto=format&fit=crop",
    category: "Abstract",
    credit: "Alex Knight",
  },
  knowledge: {
    name: "Knowledge",
    icon: "fa-book-open",
    type: "image",
    url: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1920&q=80&auto=format&fit=crop",
    category: "Abstract",
    credit: "Kimberly Farmer",
  },
  success: {
    name: "Success Path",
    icon: "fa-trophy",
    type: "image",
    url: "https://images.unsplash.com/photo-1494178270175-e96de2971df9?w=1920&q=80&auto=format&fit=crop",
    category: "Abstract",
    credit: "Clark Tibbs",
  },
};

var wallpaperManager = null;

function toggleWallpaperPanel() {
  var panel = document.getElementById("wallpaperPanel");
  if (panel) {
    panel.classList.toggle("active");
  }
}

function closeWallpaperPanel() {
  var panel = document.getElementById("wallpaperPanel");
  if (panel) {
    panel.classList.remove("active");
  }
}

function setWallpaper(type) {
  if (wallpaperManager) {
    wallpaperManager.applyWallpaper(type);
  }
  closeWallpaperPanel();
}

class WallpaperManager {
  constructor() {
    this.currentWallpaper = localStorage.getItem("srms_wallpaper") || "none";
    this.init();
  }

  init() {
    this.applyWallpaper(this.currentWallpaper);
    this.createPanel();
    this.createToggleButton();
  }

  applyWallpaper(type) {
    var wallpaper = WALLPAPERS[type] || WALLPAPERS["none"];

    if (wallpaper.type === "gradient") {
      document.body.style.background = wallpaper.css;
      document.body.style.backgroundImage = "none";
    } else {
      document.body.style.backgroundImage =
        'linear-gradient(rgba(10, 14, 39, 0.55), rgba(10, 14, 39, 0.65)), url("' +
        wallpaper.url +
        '")';
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundPosition = "center";
      document.body.style.backgroundAttachment = "fixed";
      document.body.style.backgroundRepeat = "no-repeat";
    }

    this.currentWallpaper = type;
    localStorage.setItem("srms_wallpaper", type);
    this.updateActiveStates();
  }

  updateActiveStates() {
    document.querySelectorAll(".wallpaper-option").forEach(
      function (opt) {
        opt.classList.remove("active");
        if (opt.dataset.wallpaper === this.currentWallpaper) {
          opt.classList.add("active");
        }
      }.bind(this),
    );
  }

  createPanel() {
    var existingPanel = document.getElementById("wallpaperPanel");
    if (existingPanel) existingPanel.remove();

    var panel = document.createElement("div");
    panel.id = "wallpaperPanel";
    panel.className = "wallpaper-panel";

    var html =
      '<div class="wallpaper-panel-header">' +
      '<h3><i class="fas fa-image"></i> Wallpapers</h3>' +
      '<button class="wallpaper-panel-close" onclick="closeWallpaperPanel()">' +
      '<i class="fas fa-times"></i>' +
      "</button>" +
      "</div>" +
      '<div class="wallpaper-panel-grid">';

    var keys = Object.keys(WALLPAPERS);
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var wallpaper = WALLPAPERS[key];
      var isActive = key === this.currentWallpaper ? " active" : "";
      html +=
        '<div class="wallpaper-option' +
        isActive +
        '" data-wallpaper="' +
        key +
        '" onclick="setWallpaper(\'' +
        key +
        '\')" title="' +
        wallpaper.name +
        '">' +
        '<i class="fas ' +
        wallpaper.icon +
        '"></i>' +
        "<span>" +
        wallpaper.name +
        "</span>" +
        "</div>";
    }

    html += "</div>";
    panel.innerHTML = html;
    document.body.appendChild(panel);
  }

  createToggleButton() {
    var existingBtn = document.getElementById("wallpaperToggle");
    if (existingBtn) existingBtn.remove();

    var button = document.createElement("button");
    button.id = "wallpaperToggle";
    button.className = "wallpaper-toggle";
    button.title = "Change Wallpaper";
    button.innerHTML = '<i class="fas fa-image"></i>';
    button.onclick = function () {
      toggleWallpaperPanel();
    };

    document.body.appendChild(button);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  wallpaperManager = new WallpaperManager();
});

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    closeWallpaperPanel();
  }
});

document.addEventListener("click", function (e) {
  var panel = document.getElementById("wallpaperPanel");
  var toggleBtn = document.getElementById("wallpaperToggle");
  if (panel && panel.classList.contains("active")) {
    if (!panel.contains(e.target) && !toggleBtn.contains(e.target)) {
      closeWallpaperPanel();
    }
  }
});

window.WALLPAPERS = WALLPAPERS;
window.toggleWallpaperPanel = toggleWallpaperPanel;
window.closeWallpaperPanel = closeWallpaperPanel;
window.setWallpaper = setWallpaper;
