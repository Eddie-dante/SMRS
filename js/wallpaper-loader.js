// ============================================
// SRMS - Wallpaper Loader
// ============================================

var WALLPAPER_DATA = {
    none: {
        name: 'Dark Gradient',
        type: 'gradient',
        css: 'linear-gradient(135deg, #0a0e27 0%, #1a1f4e 50%, #0f3460 100%)'
    },
    library: {
        name: 'Library Classic',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1920&q=80&auto=format&fit=crop'
    },
    classroom: {
        name: 'Modern Classroom',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1920&q=80&auto=format&fit=crop'
    },
    bookshelf: {
        name: 'Bookshelf Heaven',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1920&q=80&auto=format&fit=crop'
    },
    graduation: {
        name: 'Graduation Day',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1523050854058-8df90910f68e?w=1920&q=80&auto=format&fit=crop'
    },
    lecture: {
        name: 'Lecture Hall',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=1920&q=80&auto=format&fit=crop'
    },
    computer: {
        name: 'Computer Lab',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1571266028243-e4c84c8a40b7?w=1920&q=80&auto=format&fit=crop'
    },
    science: {
        name: 'Science Lab',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1920&q=80&auto=format&fit=crop'
    },
    playground: {
        name: 'Playground Fun',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1472898965229-f9b06b9c9bbe?w=1920&q=80&auto=format&fit=crop'
    },
    campus: {
        name: 'Sunset Campus',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=1920&q=80&auto=format&fit=crop'
    },
    ocean: {
        name: 'Ocean View',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80&auto=format&fit=crop'
    },
    forest: {
        name: 'Forest Path',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=80&auto=format&fit=crop'
    },
    mountain: {
        name: 'Mountain Peak',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80&auto=format&fit=crop'
    },
    galaxy: {
        name: 'Galaxy Stars',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1920&q=80&auto=format&fit=crop'
    },
    citynight: {
        name: 'City Lights',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1920&q=80&auto=format&fit=crop'
    },
    autumn: {
        name: 'Autumn Leaves',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80&auto=format&fit=crop'
    },
    winter: {
        name: 'Winter Snow',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1477601263568-180e2c6d046e?w=1920&q=80&auto=format&fit=crop'
    },
    spring: {
        name: 'Spring Flowers',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=1920&q=80&auto=format&fit=crop'
    },
    summer: {
        name: 'Summer Beach',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80&auto=format&fit=crop'
    },
    abstract: {
        name: 'Abstract Art',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1920&q=80&auto=format&fit=crop'
    },
    geometric: {
        name: 'Geometric',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1550859492-d5da9d8e45f3?w=1920&q=80&auto=format&fit=crop'
    },
    minimalist: {
        name: 'Minimalist',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1920&q=80&auto=format&fit=crop'
    },
    blueabstract: {
        name: 'Blue Abstract',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1920&q=80&auto=format&fit=crop'
    },
    purple: {
        name: 'Purple Haze',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=1920&q=80&auto=format&fit=crop'
    },
    technology: {
        name: 'Technology',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1920&q=80&auto=format&fit=crop'
    }
};

document.addEventListener('DOMContentLoaded', function() {
    var savedWallpaper = localStorage.getItem('srms_wallpaper') || 'none';
    var wallpaper = WALLPAPER_DATA[savedWallpaper] || WALLPAPER_DATA['none'];
    
    if (wallpaper.type === 'gradient') {
        document.body.style.background = wallpaper.css;
        document.body.style.backgroundImage = 'none';
    } else {
        document.body.style.backgroundImage = 'linear-gradient(rgba(10, 14, 39, 0.55), rgba(10, 14, 39, 0.65)), url("' + wallpaper.url + '")';
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundAttachment = 'fixed';
        document.body.style.backgroundRepeat = 'no-repeat';
    }
});

window.WALLPAPER_DATA = WALLPAPER_DATA;