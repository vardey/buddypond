export default function defaultMenuBar(bp) {

  // Ported from Legacy bp v4
  let selectMusicPlaylist2 = `
    <select name="selectPlaylist" class="selectPlaylist float_right">
    <option>Select music playlist...</option>
    <option value="1397230333">Buddy House 0 ( 33 Tracks )</option>
    <option value="1397493787">Buddy House 1 ( 10 Tracks )</option>
    <option value="1427128612">Buddy House 2 ( 10 Tracks )</option>
    </select>
    `;


      let selectMusicPlaylist = `
<div class="dropdown-wrapper float_right select-playlist-dropdown-menu">
  <span class="icon trigger" title="Select Music Playlist">
    <i class="fa-duotone fa-regular fa-music"></i> Select Music Playlist
  </span>
  <ul class="dropdown-menu" style="display: none;">
    <li data-value="1397230333">Buddy House 0 (33 Tracks)</li>
    <li data-value="1397493787">Buddy House 1 (10 Tracks)</li>
    <li data-value="1427128612">Buddy House 2 (10 Tracks)</li>
  </ul>
</div>
    `;

  // change to select background / wallpaper / customize theme
  let selectTheme = `
    <select name="selectTheme" class="selectTheme float_right">
    <option value="Light">Light Theme</option>
    <option value="Dark">Dark Theme</option>
    <option value="Nyan">Nyan Theme</option>
    <option value="Hacker">Hacker Theme</option>
    <option value="Water">Water Theme</option>
    <option value="Customize">Customize...</option>
    <!--
    <option value="Customize">EPIC MODE ( my poor browser ) </option>
    <option value="Customize">Comic Theme</option> 
    -->
    </select>
    `;



  //        <span class="personalizeDesktop float_right"><i class="fa-duotone fa-regular fa-desktop" title="Desktop Settings"></i>Desktop Settings</span>

  let selectDesktopSettings = `
<div class="dropdown-wrapper desktop-settings-dropdown-menu">
  <span class="icon trigger" title="Desktop Settings">
    <i class="fa-duotone fa-regular fa-desktop"></i> Desktop Settings
  </span>
  <ul class="dropdown-menu" style="display: none;">
    <li data-value="open">Open Desktop Settings</li>
    <li data-value="matrix">Matrix Wallpaper</li>
    <li data-value="nyancat">Nyan Cat Wallpaper</li>
    <li data-value="ripples">Ripples Wallpaper</li>
    <li data-value="urlWallpaper">Set Wallpaper to Url</li>
    <li data-value="default">Default Wallpaper</li>
  </ul>
</div>
    `;


 let sourceCodeStr = `
 <div class="dropdown-wrapper desktop-settings-dropdown-menu">
   <span class="icon trigger" title="Developers">
    <i class="fa-duotone fa-regular fa-code"></i> Developers
   </span>
   <ul class="dropdown-menu" style="display: none;">
     <li class="open-link" data-link="https://github.com/buddypond/buddypond">View Source Code</li>
     <li class="open-link" data-link="https://buddypond.com/sdk">Developer SDK</li>
   </ul>
 </div>
   `;
 
  
  // use fonr-awesome sun and moon icons
  let selectLightMode = '<span class="selectLightMode float_right"><i class="fa-duotone fa-regular fa-sun" data-mode="Light" title="Light Mode"></i><i class="fa-duotone fa-regular fa-moon" data-mode="Dark" title="Dark Mode"></i></span>';

  let networkStatsStr = `
      <span class="totalConnected loggedIn">
        <!-- <span class="totalConnectedCount">0</span> Buddies Online</span> -->
        <span class="desktopDisconnected loggedOut">Disconnected</span>
            
    `;

  let volumeStr = `
    <div class="volume">
    <span class="volumeIcon volumeToggle volumeFull">🔊</span>
    <span class="volumeIcon volumeToggle volumeMuted">🔇</span>
    <div class="volumeSliderContainer">
    <div id="toggleVolumeSlider" class="volumeSlider"></div>
    </div>
    
    </div>
    `;

  let clockStr = `
    <span class="" id="clock"></span>
    `;

  let menuTemplate = [
    {
      label: '<span id="me_title" class="me_title">Welcome - You look nice today!</span>',
      submenu: [
        {
          label: '<span>We are stoked to be your Buddy</span>',
          className: 'desktop-only'
          // click: () => api.ui.toggleDeviceSettings() 
        },
              {
          label: 'Buddy Apps',
          closeMenu: true,
          click: () => bp.open('pad')
        },

        {
          label: 'Edit Profile',
          closeMenu: true,
          click: () => bp.open('profile')
        },
        {
          label: '<span>Login</span>',
          className: 'loggedOut',
          //visible: !bp.apps.client.isLoggedIn(), // Only show if logged out
          click: () => bp.open('buddylist')
        },
        {
          label: '<span class="loggedIn">Logout</span>',
          //visible: bp.apps.client.isLoggedIn(), // Only show if logged in
          click: () => {
            if (bp.logout) {
              bp.logout();
            }
            //bp.apps.client.logout();
            // Close all chat windows and ponds
            bp.apps.ui.windowManager.windows.forEach((window) => {
              if (window.app === 'buddylist' && (window.type === 'buddy' || window.type === 'pond')) {
                window.close();
              }
              if (window.app === 'pond') {
                window.close();
              }
            });
          }
        }
      ]
    },
    {
      label: 'Window',
      className: "desktop-only",
      submenu: [
        { label: 'Full Screen', click: () => bp.apps.ui.toggleFullScreen() },
        {
          label: 'Hide All Windows',
          click: () => bp.apps.ui.windowManager.minimizeAllWindows()
        },
        /*
        {
            label: 'Set Active Window to Wallpaper',
            disabled: true,
            click: () => {
                if (!desktop.ui.wallpaperWindow) {
                    desktop.ui.wallpaperWindow = true;
                    desktop.ui.removeWindowWallpaper();
                    desktop.ui.setActiveWindowAsWallpaper();
                    $('.setWindowAsWallpaper').html('Remove Window as Wallpaper');
                } else {
                    desktop.ui.wallpaperWindow = false;
                    desktop.ui.removeWindowWallpaper();
                    $('.setWindowAsWallpaper').html('Set Active Window to Wallpaper');
                }
                return false;
            }
        } */

      ]
    },
    {
      label: '<span style="display:flex;">$GBP Coin Balance: <span id="menu-bar-coin-balance" class="odometer">0</span></span>',
      submenu: [
        {
          label: 'View Coin Balance',
          closeMenu: true,
          click: () => bp.open('portfolio')
        },
        /*
        {
          label: 'Buy Coins',
          click: () => bp.open('buycoins')
        },
        */
        {
          label: 'Send Coins',
          closeMenu: true,
          click: () => bp.open('portfolio', { context: '#portfolio-transfer' })
        }
      ]
    },
    {
      className: 'loggedIn',
      label: `
              <span>Reward in: <span id="menu-bar-coin-reward-coindown" class="countdown-date">0:59</span></span>
              <!-- <span class="loggedOut">Login to get Coin Rewards</span> -->
            `,
    },
    /*
    {
      label: 'Help',
      click: () => bp.open('help')
    },
    */

    { label: '', flex: 1, className: "desktop-only" }, // empty space


    { label: selectMusicPlaylist, className: "desktop-only" },

    // { label: selectTheme },
    // { label: desktopSettings },
    {
      label: selectDesktopSettings,
      /*
      click: () => {
        // open the personalize desktop window
        bp.open('profile', { context: 'themes' });
      }
      */
    },

    // { label: networkStatsStr },
    {
      label: sourceCodeStr,
      click: async (ev) => {
        // alert('click')
        let target = ev.target;
            let url = $(target).data('link');
            if (!url) {
                // check if tag has href attribute
                url = $(target).attr('href');
            }

            if (window.discordMode) {
                await window.discordSdk.commands.openExternalLink({
                    url: url
                });
                return;
            } else {
                window.open(url, '_blank');
            }


        // open a new window to https://github.com/buddypond/buddypond
        // let url = 'https://github.com/buddypond/buddypond';
        // window.open(url, '_blank');
      }
    },
    { label: selectLightMode },

    {
      label: volumeStr,
      click: () => {
        console.log('Volume toggle clicked');
        toggleVolumeSlider();
      }

    },
    { label: clockStr }
  ];

  const toggleVolumeSlider = () => {
    const $container = $('.volumeSliderContainer');

    if ($container.is(':visible')) {
      $container.hide();
      return;
    }

    $container.show();

    let currentVolume = bp.get('audio_volume') * 100;
    if (isNaN(currentVolume)) currentVolume = 100;

    $("#toggleVolumeSlider").slider({
      min: 0,
      max: 100,
      value: currentVolume,
      create: function () {
        let handle = $(this).find('.ui-slider-handle');
        handle.append('<span class="slider-value">' + currentVolume + '</span>');
      },
      slide: function (event, ui) {
        bp.set('audio_volume', ui.value / 100);
        $(this).find('.slider-value').text(ui.value);
      }
    });
  };


  return menuTemplate;

}