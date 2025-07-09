export default class UrlWallpaper {
    constructor(canvasId, settings) {
    }
  
    setUrl(url) {
        
        // set the #wallpaper element to the url
        let wallpaper = document.getElementById('wallpaper');
        wallpaper.src = url;

        // save the wallpaper setting in local storage
        // bp.set('wallpaper_url', url);
    }

    start() {
        let url = bp.settings.wallpaper_url;
        // Optionally give a short pause to allow other canvas operations to stop
        setTimeout(() => {
            this.setUrl(url);
        }, 33);
        // canvasBackground hide
        $('.canvasBackground').hide();
        $('#wallpaper').fadeIn({
            easing: 'linear',
            duration: 555
        });
    }
  
    stop() {
        // Stopping the solid wallpaper doesn't need to clear anything
         $('.canvasBackground').show();
        // hide the wallpaper element
        $('#wallpaper').hide();
    }
  
    pause() {
        // Pausing the solid wallpaper doesn't need to do anything
    }
  }
  