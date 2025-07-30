window.bp_v_5 = async function bp_v_5() {

    // Wait for the error-tracker to load, so we may capture any potential errors during the loading process
    await bp.load('error-tracker', {
        apiEndpoint: buddypond.errorsEndpoint
    });

    setConfig(); // probably can remove this

    // Must wait for localstorage and buddyscript to load before loading the rest of the apps
    await Promise.all([
        bp.load('localstorage'),
        bp.load('buddyscript')
    ]);

    await loadCoreApps();

    // desktop is loaded at this stage, continue with other apps
    // load what is required for buddylist and login
    let allCommands = bp.apps.buddyscript.commands;

    await bp.open('client');

    await bp.load('card');


    // bp.load('appstore'); // replaced with pads
    if (!bp.loadedFromApp) {
        // bp.open('motd');
        let buddylist = await bp.open({
            name: 'welcome',
            autocomplete: allCommands,
            openDefaultPond: true // for now
        });

    } else {
        if (!window.discordView) {


            await bp.open({
                name: 'welcome',
                autocomplete: allCommands
            });
        }

    }

    // Remark: Do we need to load the pond here, or can we wait until login is successful?
    await bp.load('pond');

    // load any other apps that are non-essential but still useful
    // bp.load('console');
    bp.load('clock');

    bp.load('say');
    bp.load('droparea');
    bp.load('file-viewer');
    bp.load('rewards');
    bp.load('pad');


    // await bp.open('audio-player');

    // defer loading of apps that are not essential for the initial experience
    // but will be clicked or loaded from chat window or other places
    // this is used to increase responsiveness of user experience ( i.e. clicking on buttons )
    // TODO: ensure this starts *after* app is ready. this should be OK for now, but we could tighten the timing
    function deferLoad() {
        setTimeout(async () => {
            console.log('Now defer loading additional apps...');

            // load apps from the chat button bar
            // try adding a small sleep between deferred loads to prevent potential lag to the UI thread
            // These are services used in the chat window, better to preload them so there is no lag when the user clicks on them
            await bp.load('image-search');
            await sleep(100);
            await bp.load('ramblor');
            await sleep(100);
            await bp.load('dictate');
            await sleep(100);
            //await bp.load('markdown');
            //await sleep(100);

            // from the top menu bar
            await bp.load('soundcloud');
            await sleep(100);

            await bp.load('videochat');
            await sleep(100);

            // preload all installed desktop apps
            let apps = Object.keys(bp.settings.apps_installed || {});

            for (let appId of apps) {
                let app = bp.settings.apps_installed[appId];
                // console.log('Defer loading app:', appId, app);
                await bp.load(app.app || appId);
                await sleep(100);
            }
            console.log('Deferred loading of additional apps completed.');
        }, 7000);
    }
    window.deferLoad = deferLoad;

};


function setConfig() {
    bp.setConfig({
        host: _host,
        api: _api,
        cdn: _cdn,
        portfolioEndpoint: _portfolioEndpoint,
        coinEndpoint: _coinEndpoint,
        orderbookEndpoint: _orderbookEndpoint,
    });
}

async function loadCoreApps() {

    bp.load('wallpaper'); // load wallpaper app first, as it is used by desktop and other apps
    bp.load('themes'); // load themes app first, as it is used by desktop and other apps

    // we *must* wait for the UI since it contains openWindow() method
    // and other methods that are used by apps
    await bp.importModule({
        name: 'ui',
        parent: $('#desktop').get(0),
        window: {
            onFocus(window) {
                // console.log('custom onFocus window focused');
                // legacy window check ( we can remove this after all windows are converted to new window )
                // get all the legacy windows and check z-index to ensure
                // our window is +1 of the highest z-index
                let legacyWindows = $('.window');
                let highestZ = 0;
                let anyVisible = false;
                legacyWindows.each((i, el) => {
                    let z = parseInt($(el).css('z-index'));
                    if (z > highestZ) {
                        highestZ = z;
                    }
                    if ($(el).is(':visible')) {
                        anyVisible = true;
                    }
                });
                // set the z-index of the current window to highestZ + 1
                if (legacyWindows.length > 0 && anyVisible) {
                    console.log('legacyWindows', legacyWindows);
                    console.log('highestZ', highestZ);
                    console.log('setting window depth to', highestZ + 1);
                    window.setDepth(highestZ + 1);
                }
            },
        }
    });

    // desktop can be fire-and-forget loaded, as long as we don't call arrangeDesktop()
    // before it the desktop is ready
    bp.importModule({
        name: 'desktop',
        parent: $('#desktop').get(0),
    }, {}, true, function () {
        window.arrangeDesktop();
    });

    // menubar can be fire-and-forget loaded, as long as UI is ready
    bp.load('menubar');

}

let sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));