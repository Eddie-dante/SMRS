// ============================================
// SRMS - Wallpaper Loader (130+ wallpapers)
// Uses Picsum Photos URLs from curated Unsplash IDs
// + dedicated fixed background layer
// ============================================

var WALLPAPER_DATA = {
  none: {
    name: "Dark Gradient",
    icon: "fa-moon",
    type: "gradient",
    css: "linear-gradient(135deg, #0a0e27 0%, #1a1f4e 50%, #0f3460 100%)",
    category: "Default",
  },

  // ===== SCHOOL (28) =====
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
  whiteboard: {
    name: "Whiteboard",
    icon: "fa-chalkboard-teacher",
    type: "image",
    category: "School",
    url: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1920&q=80&auto=format&fit=crop",
  },

  // ===== NATURE (30) =====
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
  desert: {
    name: "Desert Dunes",
    icon: "fa-sun",
    type: "image",
    category: "Nature",
    url: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1920&q=80&auto=format&fit=crop",
  },
  waterfall: {
    name: "Waterfall",
    icon: "fa-water",
    type: "image",
    category: "Nature",
    url: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=1920&q=80&auto=format&fit=crop",
  },
  lake: {
    name: "Mountain Lake",
    icon: "fa-water",
    type: "image",
    category: "Nature",
    url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1920&q=80&auto=format&fit=crop",
  },
  rainforest: {
    name: "Rainforest",
    icon: "fa-tree",
    type: "image",
    category: "Nature",
    url: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=80&auto=format&fit=crop",
  },
  beachsunset: {
    name: "Beach Sunset",
    icon: "fa-sun",
    type: "image",
    category: "Nature",
    url: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1920&q=80&auto=format&fit=crop",
  },
  canyon: {
    name: "Canyon",
    icon: "fa-mountain",
    type: "image",
    category: "Nature",
    url: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&q=80&auto=format&fit=crop",
  },
  tropical: {
    name: "Tropical Paradise",
    icon: "fa-umbrella-beach",
    type: "image",
    category: "Nature",
    url: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=1920&q=80&auto=format&fit=crop",
  },
  meadows: {
    name: "Meadow Fields",
    icon: "fa-seedling",
    type: "image",
    category: "Nature",
    url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&q=80&auto=format&fit=crop",
  },
  iceland: {
    name: "Iceland",
    icon: "fa-mountain",
    type: "image",
    category: "Nature",
    url: "https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=1920&q=80&auto=format&fit=crop",
  },
  cliffs: {
    name: "Ocean Cliffs",
    icon: "fa-water",
    type: "image",
    category: "Nature",
    url: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1920&q=80&auto=format&fit=crop",
  },
  bloom: {
    name: "Spring Bloom",
    icon: "fa-flower",
    type: "image",
    category: "Nature",
    url: "https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=1920&q=80&auto=format&fit=crop",
  },

  // ===== CITY (14) =====
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
  skyline: {
    name: "City Skyline",
    icon: "fa-city",
    type: "image",
    category: "City",
    url: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1920&q=80&auto=format&fit=crop",
  },
  tokyo: {
    name: "Tokyo Night",
    icon: "fa-city",
    type: "image",
    category: "City",
    url: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=1920&q=80&auto=format&fit=crop",
  },
  paris: {
    name: "Paris",
    icon: "fa-landmark",
    type: "image",
    category: "City",
    url: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1920&q=80&auto=format&fit=crop",
  },
  dubai: {
    name: "Dubai Skyline",
    icon: "fa-city",
    type: "image",
    category: "City",
    url: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1920&q=80&auto=format&fit=crop",
  },
  venice: {
    name: "Venice Canals",
    icon: "fa-water",
    type: "image",
    category: "City",
    url: "https://images.unsplash.com/photo-1514890547357-a9ee288728e0?w=1920&q=80&auto=format&fit=crop",
  },
  nyc: {
    name: "New York",
    icon: "fa-city",
    type: "image",
    category: "City",
    url: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1920&q=80&auto=format&fit=crop",
  },

  // ===== ABSTRACT (18) =====
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
  gradientwave: {
    name: "Gradient Wave",
    icon: "fa-wave-square",
    type: "image",
    category: "Abstract",
    url: "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1920&q=80&auto=format&fit=crop",
  },
  paint: {
    name: "Paint Splash",
    icon: "fa-palette",
    type: "image",
    category: "Abstract",
    url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1920&q=80&auto=format&fit=crop",
  },
  neon: {
    name: "Neon Lights",
    icon: "fa-lightbulb",
    type: "image",
    category: "Abstract",
    url: "https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=1920&q=80&auto=format&fit=crop",
  },
  marble: {
    name: "Marble Texture",
    icon: "fa-gem",
    type: "image",
    category: "Abstract",
    url: "https://images.unsplash.com/photo-1554188248-986adbb73be4?w=1920&q=80&auto=format&fit=crop",
  },
  liquid: {
    name: "Liquid Art",
    icon: "fa-tint",
    type: "image",
    category: "Abstract",
    url: "https://images.unsplash.com/photo-1550859492-d5da9d8e45f3?w=1920&q=80&auto=format&fit=crop",
  },
  hexagon: {
    name: "Hexagon Pattern",
    icon: "fa-shapes",
    type: "image",
    category: "Abstract",
    url: "https://images.unsplash.com/photo-1553356084-58ef4a67b2a7?w=1920&q=80&auto=format&fit=crop",
  },
  ink: {
    name: "Ink Flow",
    icon: "fa-paint-brush",
    type: "image",
    category: "Abstract",
    url: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=1920&q=80&auto=format&fit=crop",
  },
  holographic: {
    name: "Holographic",
    icon: "fa-star",
    type: "image",
    category: "Abstract",
    url: "https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=1920&q=80&auto=format&fit=crop",
  },
  pastel: {
    name: "Pastel Blend",
    icon: "fa-palette",
    type: "image",
    category: "Abstract",
    url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1920&q=80&auto=format&fit=crop",
  },
  darkabstract: {
    name: "Dark Abstract",
    icon: "fa-moon",
    type: "image",
    category: "Abstract",
    url: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=1920&q=80&auto=format&fit=crop",
  },

  // ===== SPACE (12) =====
  galaxy: {
    name: "Galaxy Stars",
    icon: "fa-star",
    type: "image",
    category: "Space",
    url: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1920&q=80&auto=format&fit=crop",
  },
  nebula: {
    name: "Nebula",
    icon: "fa-star",
    type: "image",
    category: "Space",
    url: "https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=1920&q=80&auto=format&fit=crop",
  },
  moon: {
    name: "Full Moon",
    icon: "fa-moon",
    type: "image",
    category: "Space",
    url: "https://images.unsplash.com/photo-1532693322450-2cb5c511067d?w=1920&q=80&auto=format&fit=crop",
  },
  earth: {
    name: "Planet Earth",
    icon: "fa-globe",
    type: "image",
    category: "Space",
    url: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=1920&q=80&auto=format&fit=crop",
  },
  saturn: {
    name: "Saturn",
    icon: "fa-circle",
    type: "image",
    category: "Space",
    url: "https://images.unsplash.com/photo-1614313913007-2b4ae8ce32d6?w=1920&q=80&auto=format&fit=crop",
  },
  astronaut: {
    name: "Astronaut",
    icon: "fa-user-astronaut",
    type: "image",
    category: "Space",
    url: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=1920&q=80&auto=format&fit=crop",
  },
  milkyway: {
    name: "Milky Way",
    icon: "fa-star",
    type: "image",
    category: "Space",
    url: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&q=80&auto=format&fit=crop",
  },
  aurora: {
    name: "Aurora Borealis",
    icon: "fa-bolt",
    type: "image",
    category: "Space",
    url: "https://images.unsplash.com/photo-1483347756197-71ef80e95f73?w=1920&q=80&auto=format&fit=crop",
  },
  cosmic: {
    name: "Cosmic Clouds",
    icon: "fa-cloud",
    type: "image",
    category: "Space",
    url: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1920&q=80&auto=format&fit=crop",
  },
  starfield: {
    name: "Starfield",
    icon: "fa-star",
    type: "image",
    category: "Space",
    url: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=1920&q=80&auto=format&fit=crop",
  },
  rocket: {
    name: "Rocket Launch",
    icon: "fa-rocket",
    type: "image",
    category: "Space",
    url: "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=1920&q=80&auto=format&fit=crop",
  },
  eclipse: {
    name: "Solar Eclipse",
    icon: "fa-circle",
    type: "image",
    category: "Space",
    url: "https://images.unsplash.com/photo-1532693322450-2cb5c511067d?w=1920&q=80&auto=format&fit=crop",
  },

  // ===== SPORTS (10) =====
  soccer: {
    name: "Soccer Field",
    icon: "fa-futbol",
    type: "image",
    category: "Sports",
    url: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=1920&q=80&auto=format&fit=crop",
  },
  basketball: {
    name: "Basketball Court",
    icon: "fa-basketball-ball",
    type: "image",
    category: "Sports",
    url: "https://images.unsplash.com/photo-1519861531473-9200262188bf?w=1920&q=80&auto=format&fit=crop",
  },
  tennis: {
    name: "Tennis Court",
    icon: "fa-table-tennis",
    type: "image",
    category: "Sports",
    url: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1920&q=80&auto=format&fit=crop",
  },
  running: {
    name: "Running Track",
    icon: "fa-running",
    type: "image",
    category: "Sports",
    url: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=1920&q=80&auto=format&fit=crop",
  },
  swimming: {
    name: "Swimming Pool",
    icon: "fa-swimmer",
    type: "image",
    category: "Sports",
    url: "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=1920&q=80&auto=format&fit=crop",
  },
  cycling: {
    name: "Cycling",
    icon: "fa-bicycle",
    type: "image",
    category: "Sports",
    url: "https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=1920&q=80&auto=format&fit=crop",
  },
  gym: {
    name: "Gym",
    icon: "fa-dumbbell",
    type: "image",
    category: "Sports",
    url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80&auto=format&fit=crop",
  },
  yoga: {
    name: "Yoga",
    icon: "fa-spa",
    type: "image",
    category: "Sports",
    url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1920&q=80&auto=format&fit=crop",
  },
  stadium: {
    name: "Stadium",
    icon: "fa-futbol",
    type: "image",
    category: "Sports",
    url: "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=1920&q=80&auto=format&fit=crop",
  },
  rugby: {
    name: "Rugby Field",
    icon: "fa-football-ball",
    type: "image",
    category: "Sports",
    url: "https://images.unsplash.com/photo-1519861531473-9200262188bf?w=1920&q=80&auto=format&fit=crop",
  },

  // ===== ANIMALS (12) =====
  lion: {
    name: "Lion",
    icon: "fa-paw",
    type: "image",
    category: "Animals",
    url: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=1920&q=80&auto=format&fit=crop",
  },
  elephant: {
    name: "Elephant",
    icon: "fa-paw",
    type: "image",
    category: "Animals",
    url: "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=1920&q=80&auto=format&fit=crop",
  },
  dog: {
    name: "Puppy",
    icon: "fa-dog",
    type: "image",
    category: "Animals",
    url: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=1920&q=80&auto=format&fit=crop",
  },
  cat: {
    name: "Kitten",
    icon: "fa-cat",
    type: "image",
    category: "Animals",
    url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=1920&q=80&auto=format&fit=crop",
  },
  eagle: {
    name: "Eagle",
    icon: "fa-dove",
    type: "image",
    category: "Animals",
    url: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=1920&q=80&auto=format&fit=crop",
  },
  horse: {
    name: "Horse",
    icon: "fa-horse",
    type: "image",
    category: "Animals",
    url: "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=1920&q=80&auto=format&fit=crop",
  },
  tiger: {
    name: "Tiger",
    icon: "fa-paw",
    type: "image",
    category: "Animals",
    url: "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=1920&q=80&auto=format&fit=crop",
  },
  panda: {
    name: "Panda",
    icon: "fa-paw",
    type: "image",
    category: "Animals",
    url: "https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=1920&q=80&auto=format&fit=crop",
  },
  butterfly: {
    name: "Butterfly",
    icon: "fa-bug",
    type: "image",
    category: "Animals",
    url: "https://images.unsplash.com/photo-1444927714506-8492d94b4e3d?w=1920&q=80&auto=format&fit=crop",
  },
  bird: {
    name: "Bird",
    icon: "fa-dove",
    type: "image",
    category: "Animals",
    url: "https://images.unsplash.com/photo-1444464666168-49d633b86797?w=1920&q=80&auto=format&fit=crop",
  },
  whale: {
    name: "Whale",
    icon: "fa-water",
    type: "image",
    category: "Animals",
    url: "https://images.unsplash.com/photo-1568430462989-44163eb1752f?w=1920&q=80&auto=format&fit=crop",
  },
  dolphin: {
    name: "Dolphin",
    icon: "fa-water",
    type: "image",
    category: "Animals",
    url: "https://images.unsplash.com/photo-1607153333879-c174d265f1d2?w=1920&q=80&auto=format&fit=crop",
  },

  // ===== FOOD (8) =====
  coffee: {
    name: "Coffee",
    icon: "fa-coffee",
    type: "image",
    category: "Food",
    url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1920&q=80&auto=format&fit=crop",
  },
  pizza: {
    name: "Pizza",
    icon: "fa-pizza-slice",
    type: "image",
    category: "Food",
    url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1920&q=80&auto=format&fit=crop",
  },
  fruit: {
    name: "Fruits",
    icon: "fa-apple-alt",
    type: "image",
    category: "Food",
    url: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=1920&q=80&auto=format&fit=crop",
  },
  dessert: {
    name: "Dessert",
    icon: "fa-ice-cream",
    type: "image",
    category: "Food",
    url: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=1920&q=80&auto=format&fit=crop",
  },
  breakfast: {
    name: "Breakfast",
    icon: "fa-utensils",
    type: "image",
    category: "Food",
    url: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=1920&q=80&auto=format&fit=crop",
  },
  vegetables: {
    name: "Vegetables",
    icon: "fa-carrot",
    type: "image",
    category: "Food",
    url: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1920&q=80&auto=format&fit=crop",
  },
  sushi: {
    name: "Sushi",
    icon: "fa-fish",
    type: "image",
    category: "Food",
    url: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=1920&q=80&auto=format&fit=crop",
  },
  baking: {
    name: "Baking",
    icon: "fa-bread-slice",
    type: "image",
    category: "Food",
    url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1920&q=80&auto=format&fit=crop",
  },
};

// ---------------------------------------------------------------
// Overlay darkness config (per wallpaper)
// ---------------------------------------------------------------
function getWallpaperDarkness() {
  var saved = localStorage.getItem("srms_wallpaper_darkness");
  var v = saved !== null ? parseFloat(saved) : 0.15;
  if (isNaN(v)) v = 0.15;
  return Math.max(0, Math.min(0.7, v));
}

function buildOverlay() {
  var top = getWallpaperDarkness();
  var bottom = Math.min(0.7, top + 0.13);
  return (
    "linear-gradient(rgba(8, 12, 28, " +
    top.toFixed(2) +
    "), rgba(8, 12, 28, " +
    bottom.toFixed(2) +
    "))"
  );
}

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
    "transition:background-image 0.7s ease, background 0.7s ease;";

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

  var layer = ensureBackgroundLayer();
  transparentizeBody();

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
      var overlay = buildOverlay();
      layer.style.background = overlay + ', url("' + url + '")';
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

setupBaseStyles();
ensureBackgroundLayer();
transparentizeBody();

document.addEventListener("DOMContentLoaded", function () {
  setupBaseStyles();
  var savedWallpaper = localStorage.getItem("srms_wallpaper") || "library";
  applyWallpaper(savedWallpaper, { silent: true });
});

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
window.getWallpaperDarkness = getWallpaperDarkness;

console.log(
  "✅ Wallpaper Loader ready — " +
    Object.keys(WALLPAPER_DATA).length +
    " wallpapers across 8 categories",
);
