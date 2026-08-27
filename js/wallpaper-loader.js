// wallpaper-loader.js - Apply saved wallpaper on page load

document.addEventListener('DOMContentLoaded', function() {
    const savedWallpaper = localStorage.getItem('srms_wallpaper') || 'none';
    
    const WALLPAPERS = {
        none: {
            type: 'gradient',
            css: 'linear-gradient(135deg, #0a0e27 0%, #1a1f4e 50%, #0f3460 100%)'
        },
        library: {
            type: 'image',
            url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1920&q=80&auto=format&fit=crop'
        },
        classroom: {
            type: 'image',
            url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1920&q=80&auto=format&fit=crop'
        },
        bookshelf: {
            type: 'image',
            url: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1920&q=80&auto=format&fit=crop'
        },
        graduation: {
            type: 'image',
            url: 'https://images.unsplash.com/photo-1523050854058-8df90910f68e?w=1920&q=80&auto=format&fit=crop'
        },
        lecture: {
            type: 'image',
            url: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=1920&q=80&auto=format&fit=crop'
        },
        computer: {
            type: 'image',
            url: 'https://images.unsplash.com/photo-1571266028243-e4c84c8a40b7?w=1920&q=80&auto=format&fit=crop'
        },
        science: {
            type: 'image',
            url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1920&q=80&auto=format&fit=crop'
        },
        playground: {
            type: 'image',
            url: 'https://images.unsplash.com/photo-1472898965229-f9b06b9c9bbe?w=1920&q=80&auto=format&fit=crop'
        },
        campus: {
            type: 'image',
            url: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=1920&q=80&auto=format&fit=crop'
        },
        ocean: {
            type: 'image',
            url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80&auto=format&fit=crop'
        },
        forest: {
            type: 'image',
            url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=80&auto=format&fit=crop'
        },
        mountain: {
            type: 'image',
            url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80&auto=format&fit=crop'
        },
        galaxy: {
            type: 'image',
            url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1920&q=80&auto=format&fit=crop'
        },
        abstract: {
            type: 'image',
            url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1920&q=80&auto=format&fit=crop'
        }
    };
    
    const wallpaper = WALLPAPERS[savedWallpaper] || WALLPAPERS['none'];
    
    if (wallpaper.type === 'gradient') {
        document.body.style.background = wallpaper.css;
        document.body.style.backgroundImage = 'none';
    } else {
        document.body.style.backgroundImage = `linear-gradient(rgba(10, 14, 39, 0.55), rgba(10, 14, 39, 0.65)), url('${wallpaper.url}')`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundAttachment = 'fixed';
        document.body.style.backgroundRepeat = 'no-repeat';
    }
});
