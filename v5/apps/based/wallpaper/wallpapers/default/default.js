export default class DefaultWallpaper {
    constructor(canvasId, settings) {
    }
  
    setUrl(url) {
        
        // set the #wallpaper element to the url
        let wallpaper = document.getElementById('wallpaper');
        wallpaper.src = url;

        // save the wallpaper setting in local storage
        bp.set('wallpaper_url', url);
    }

    async start() {
        let defaultHTML = await bp.load('/v5/apps/based/wallpaper/wallpapers/default/default.html');

        // inject the background.html file contents into the div
        let wallpaper = $('#wallpaper');
        if (wallpaper.length) {
            wallpaper.hide();
        }

        // create a new div for the default wallpaper
        let defaultWallpaper = $('#wallpaper-html');
        // wrapper div should be aligned center
        defaultWallpaper.html(defaultHTML).fadeIn(1555);

        // only show frog when img is loaded
        let frogImage = $('#wallpaper-frog');
        if (frogImage.length) {
            frogImage.show();
            frogImage.on('load', () => {
                // fade in the frog image
                frogImage.fadeIn(1555);
            });
        } 

        // canvasBackground hide
        $('.canvasBackground').hide();
    }
  
    stop() {
        // Stopping the solid wallpaper doesn't need to clear anything
        // hide the wallpaper element
        let wallpaperHTML = $('#wallpaper-html');
        if (wallpaperHTML.length) {
            wallpaperHTML.hide();
        }
        $('.canvasBackground').show();
    }
  
    pause() {
        // Pausing the solid wallpaper doesn't need to do anything
    }
  }
  