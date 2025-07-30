const localIp = window.location.origin;
const currentPath = window.location.pathname;

// Endpoint Constants
const ENDPOINTS = {
  host: 'https://buddypond.com',
  api: 'https://buddypond.com/api/buddylist',
  cdn: 'https://files.buddypond.com',
  admin: 'https://buddypond.com/api/admin',
  apiKeys: 'https://buddypond.com/api/api-keys',
  apps: 'https://buddypond.com/api/apps',
  coin: 'https://buddypond.com/api/coin',
  gamblor: 'https://gamblor.buddypond.com/api/v6',
  imageSearch: 'https://buddypond.com/api/image-search',
  portfolio: 'https://buddypond.com/api/portfolio',
  orderbook: 'https://buddypond.com/api/orderbook',
  messagesApi: 'https://buddypond.com/api/messages',
  uploads: 'https://buddypond.com/api/uploads',
  errors: 'https://buddypond.com/api/errors',
  randolph: 'https://buddypond.com/api/randolph',
  buddyProxy: 'https://buddypond.com/api/proxy',
  buddylistWs: 'wss://buddypond.com/api/buddylist/ws/buddylist',
  chessWs: 'wss://buddypond.com/api/chess/ws/chess',
  messagesWs: 'wss://buddypond.com/api/messages/ws/messages',
  pondsWs: 'wss://buddypond.com/api/messages/ws/ponds',
  videoChat: 'wss://buddypond.com/api/videochat'
};

const DEV_ENDPOINTS = {
  host: localIp,
  admin: `${localIp}:8789/api/admin`,
  api: `${localIp}:8787/api/buddylist`,
  apps: `${localIp}:9008/api/apps`,
  apiKeys: `${localIp}:9009/api/api-keys`,
  buddyProxy: `${localIp}:9007/api/proxy`,
  coin: `${localIp}:9001/api/coin`,
  errors: `${localIp}:9010/api/errors`,
  gamblor: `${localIp}:9012/api/gamblor`,
  imageSearch: `${localIp}:9005/api/image-search`,
  messagesApi: `${localIp}:8788/api/messages`,
  portfolio: `${localIp}:9002/api/portfolio`,
  randolph: `${localIp}:8889/api/randolph`,
  uploads: `${localIp}:9004/api/uploads`,
  videoChat: 'wss://192.168.200.59:8001/videochat/ws',
  buddylistWs: `${localIp.replace('http://', 'ws://')}:8787/api/buddylist/ws/buddylist`,
  chessWs: `${localIp.replace('http://', 'ws://')}:5556/api/chess/ws/chess`,
  messagesWs: `${localIp.replace('http://', 'ws://')}:8788/api/messages/ws/messages`,
  pondsWs: `${localIp.replace('http://', 'ws://')}:8788/api/messages/ws/ponds`
}

// Initialize application configuration based on environment
function configureEnvironment() {
  devmode = window.location.hostname !== 'buddypond.com';
  devmode = false;
  if (devmode) {
    return DEV_ENDPOINTS
  }
  return ENDPOINTS;
}

// Configure Discord-specific settings
function configureDiscordMode(endpoints) {
  const urlParams = new URLSearchParams(window.location.search);
  const isDiscordProxy = window.location.hostname.includes('discord');
  const isDiscordView = urlParams.has('discord') && urlParams.get('discord') === 'true';

  window.discordMode = isDiscordProxy;
  window.discordView = isDiscordProxy || isDiscordView;

  if (window.discordMode) {
    const host = window.location.origin;
    return {
      ...endpoints,
      host,
      api: `${host}/.proxy/api/buddylist`,
      apps: `${host}/.proxy/api/apps`,
      uploads: `${host}/.proxy/api/uploads`,
      coin: `${host}/.proxy/api/coin`,
      portfolio: `${host}/.proxy/api/portfolio`,
      messagesWs: `${host.replace('https://', 'wss://')}/.proxy/api/messages/ws/messages`,
      buddylistWs: `${host.replace('https://', 'wss://')}/.proxy/api/buddylist/ws/buddylist`
    };
  }
  return endpoints;
}

// Assign endpoints to buddypond object
function assignBuddyPondEndpoints(endpoints) {
  buddypond.host = endpoints.host;
  buddypond.endpoint = endpoints.api;
  buddypond.messagesWsEndpoint = endpoints.messagesWs;
  buddypond.pondsWsEndpoint = endpoints.pondsWs;
  buddypond.messagesApiEndpoint = endpoints.messagesApi;
  buddypond.buddylistWsEndpoint = endpoints.buddylistWs;
  buddypond.adminEndpoint = endpoints.admin;
  buddypond.errorsEndpoint = endpoints.errors;
  buddypond.uploadsEndpoint = endpoints.uploads;
  buddypond.portfolioEndpoint = endpoints.portfolio;
  buddypond.coinEndpoint = endpoints.coin;
  buddypond.randolphEndpoint = endpoints.randolph;
  buddypond.imageSearchEndpoint = endpoints.imageSearch;
  buddypond.buddyProxy = endpoints.buddyProxy;
  buddypond.appsEndpoint = endpoints.apps;
  buddypond.apiKeysEndpoint = endpoints.apiKeys;
  buddypond.chessWsEndpoint = endpoints.chessWs;
  buddypond.gamblorEndpoint = endpoints.gamblor;
  buddypond.videoChatEndpoint = endpoints.videoChat;
}

// Main initialization function
window.bp_init = async function () {
  let renderBpApp = true;
  let loadedFromApp = false;

  if (currentPath !== '/') {
    if (currentPath.startsWith('/app/')) {
      loadedFromApp = true;
    } else {
      renderBpApp = false;
      console.log('currentPath', currentPath);
    }
  }

  let endpoints = configureEnvironment();
  endpoints = configureDiscordMode(endpoints);

  endpoints.host = DEV_ENDPOINTS.host; // manaul override for development
  console.log('Using endpoints:', endpoints);
  assignBuddyPondEndpoints(endpoints);


  if (!renderBpApp) {
    renderBuddyPad(currentPath);
    return;
  }

  $(document).ready(async function () {

    bp.loadedFromApp = loadedFromApp;

    documentReady();
  });
};

async function documentReady() {

  bp.on('bp::loading', 'update-loading-text', function (resource) {
    const resourceName = typeof resource === 'object' ? resource.name : resource;
    console.log(`Loading ${resourceName}...`);
    $('.loaderText').text(`Loading ${resourceName}...`);
  });

  const urlParams = new URLSearchParams(window.location.search);
  const discordId = urlParams.get('discord_id');
  if (discordId) linkDiscordAccount(discordId);

  const rtoken = urlParams.get('rtoken');
  const buddyname = urlParams.get('buddyname');

  await bp_loadApps();

  const documentReadyTime = new Date();
  const fadeInDelay = (new Date().getTime() - documentReadyTime.getTime() > 3333) ? 111 : 555;

  $('#loaderHolder').fadeOut({
    easing: 'linear',
    duration: fadeInDelay,
    complete: async function () {
      $('#mainOverlay').fadeIn({ easing: 'linear', duration: 333 });
      $('.taskbar-container').css('display', 'flex').hide().fadeIn({ easing: 'linear', duration: 555 });

      await handleAppRouting(currentPath, urlParams);

      if (rtoken && buddyname) {
        await handlePasswordReset(rtoken, buddyname);
      }
    }
  });
}

// Handle Discord account linking
function linkDiscordAccount(discordId) {
  console.log(`Linking Discord account with ID: ${discordId}`);

  buddypond.apiRequest(`/auth/link-discord`, 'POST', { discord_id: discordId }, (err, data) => {
    console.log('Link Discord response:', err, data);
    if (err || !data.success) {
      if (err.message === 'HTTP 401: Unauthorized') {
        alert('You must be logged in to link your Discord account.');
        window.tempDiscordId = discordId;
      } else {
        const errorMessage = data.message || 'An unknown error occurred while linking your Discord account.';
        alert(errorMessage);
        console.error('Error linking Discord account:', err, data);
      }
      return;
    }
    alert('Successfully linked Discord account!');
    console.log('Linked Discord account:', data);
  });
}

// Handle password reset
async function handlePasswordReset(rtoken, buddyname) {
  console.log('Processing password reset with rtoken:', rtoken);
  buddypond.apiRequest(`/auth/reset-password?rtoken=${rtoken}&buddyname=${buddyname}`, 'GET', {}, (err, data) => {
    if (err || !data.success) {
      alert(data.message || err.message);
      console.log('Password reset response:', err, data);
      return;
    }

    buddypond.me = buddyname;
    buddypond.qtokenid = data.qtokenid;
    localStorage.setItem('qtokenid', data.qtokenid);
    localStorage.setItem('me', buddyname);
    bp.emit('auth::qtoken', data);
    bp.open('pincode');
    window.history.pushState({ path: window.location.pathname }, '', window.location.pathname);
  });
}

// Render BuddyPad iframe for non-root paths
function renderBuddyPad(currentPath) {
  $('body').empty().css({ padding: '0', margin: '0', border: 'none' });

  const buddypadIframe = document.createElement('iframe');
  buddypadIframe.id = 'buddypad';
  buddypadIframe.style.width = '100%';
  buddypadIframe.style.height = '800px';
  buddypadIframe.style.border = 'none';

  $('body').append(buddypadIframe);

  const filesSrc = `https://files.buddypond.com${currentPath}`;
  console.log('Setting BuddyPad src to', filesSrc);
  console.log(`You may visit ${filesSrc} directly in your browser.`);
  $('#buddypad').attr('src', filesSrc);
}

// Handle app routing for /app/* paths
async function handleAppRouting(currentPath, urlParams) {
  if (!currentPath.startsWith('/app/')) return false;

  const appName = currentPath.split('/')[2];
  console.log('Opening app:', appName);

  const appContext = urlParams.has('context') ? urlParams.get('context') : 'default';

  const win = await bp.open(appName, {
    context: appContext,
    output: 'window',
    urlParams
  });

  console.log('Opened app:', win);
  if (win) {
    if (!win.isMaximized && win.maximize) {
      win.maximize();
    }
    return true;
  }

  bp.loadedFromApp = false;
  const allCommands = bp.apps.buddyscript.commands;
  // only show welcome if qtokenid is not set
  if (!bp.qtokenid) {
    console.log('No qtokenid found, opening welcome app');
    await bp.open({ name: 'welcome', autocomplete: allCommands, openDefaultPond: true });
    return false;
  }
  //await bp.open({ name: 'welcome', autocomplete: allCommands });
  //return false;
}

window.bp_loadApps = async function bp_loadApps() {

  // Wait for the error-tracker to load, so we may capture any potential errors during the loading process
  await bp.load('error-tracker', {
    apiEndpoint: buddypond.errorsEndpoint
  });

  setConfig(); // probably can remove this

  await loadCoreApps();

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
    host: ENDPOINTS.host,
    api: ENDPOINTS.api,
    cdn: ENDPOINTS.cdn,
    portfolioEndpoint: ENDPOINTS.portfolio,
    coinEndpoint: ENDPOINTS.coin,
    orderbookEndpoint: ENDPOINTS.orderbook
  });
}

async function loadCoreApps() {

  // Must wait for localstorage and buddyscript to load before loading the rest of the apps
  await Promise.all([
    bp.load('localstorage'),
    bp.load('buddyscript')
  ]);


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

  await bp.open('client');

  await bp.load('card');

  // desktop is loaded at this stage, continue with other apps
  // load what is required for buddylist and login
  let allCommands = bp.apps.buddyscript.commands;

  // bp.load('appstore'); // replaced with pads
  if (!bp.loadedFromApp) {
    // bp.open('motd');
      // if we are not logged in, open the welcome app
      // this will also load the buddylist app
      console.log('No qtokenid found, opening welcome app');
      if (!window.discordView) {

        await bp.open({
          name: 'welcome',
          autocomplete: allCommands,
          openDefaultPond: true // for now
        });
      }
      if (window.discordView) {
        await bp.open('coin', {
          type: 'leaderboard'
        })
      }

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

}

let sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));