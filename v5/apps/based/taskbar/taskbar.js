import TaskBar from '../ui/Window/TaskBar.js';

export default class TaskBarApp {
  constructor(bp, options = {}) {
    this.bp = bp;
    return this;
  }

  async init() {
    return 'loaded TaskBarApp';
  }

  async open(options = {}) {

    if (this.taskBar) {
      console.log('TaskBar already open');
      //$('.taskbar-container').css('display', 'flex').hide().fadeIn({ easing: 'linear', duration: 555 });
      return;
    }
    // Remark: Why is TaskBar in the WindowManager?
    // shouldn't this be in the UI class?
    this.taskBar = new TaskBar({
      bp: this.bp,
      homeCallback: () => {

        if (!this.state) {
          // save current window positions
          this.lastPositionsBeforeArranged = this.windows.map(w => {
            return {
              x: w.x,
              y: w.y,
              height: w.height,
              width: w.width
            }
          });
          // console.log('lastPositionsBeforeArranged', this.lastPositionsBeforeArranged);
          this.state = 'maximized';
        }

        if (this.state === 'minimized') {
          this.minimizeAllWindows();
          // this.arrangeHorizontalStacked();
          this.state = 'maximized';

        } else if (this.state === 'stacked-vertical') {
          // stack-vertical has been removed ( for now )
          // it wasn't looking good as a default and was rarely used
          /*
          // restore all windows to their previous positions
          this.windows.forEach((w, i) => {
              w.move(this.lastPositionsBeforeArranged[i].x, this.lastPositionsBeforeArranged[i].y);
              w.setSize(this.lastPositionsBeforeArranged[i].width + 'px', this.lastPositionsBeforeArranged[i].height + 'px');
          });
          this.state = 'maximized';
          */

        } else if (this.state === 'stacked-horizontal') {
          // this.arrangeVerticalStacked();
          // this.state = 'stacked-vertical';
          // restore all windows to their previous positions
          this.windows.forEach((w, i) => {
            w.move(this.lastPositionsBeforeArranged[i].x, this.lastPositionsBeforeArranged[i].y);
            w.setSize(this.lastPositionsBeforeArranged[i].width + 'px', this.lastPositionsBeforeArranged[i].height + 'px');
          });
          this.state = 'maximized';

        } else {
          this.minimizeAllWindows(true);
          this.windows.forEach((w, i) => {
            w.move(this.lastPositionsBeforeArranged[i].x, this.lastPositionsBeforeArranged[i].y);
            w.setSize(this.lastPositionsBeforeArranged[i].width + 'px', this.lastPositionsBeforeArranged[i].height + 'px');
          });

          this.state = 'minimized';

        }

        // close all windows
        // this.minimizeAllWindows();
        // this.windowsClosed = true;

        // hide all legacy BP windows
        $('.window').hide();
        $('.window').removeClass('window_stack');

      }
    });

    let installedTaskBarApps = this.bp.settings.taskbar_apps || {};

    if (Object.keys(installedTaskBarApps).length === 0) {

        let defaultTaskBarApps = [
            'file-explorer',
            'pad',
            'buddylist',
            // 'pond',
            'portfolio',
        ];

        if (this.bp.isMobile()) {
            defaultTaskBarApps = [
                'buddylist',
                // 'pond',
                'portfolio',
                'coin',
                //'youtube',
                'fluid-simulation',
            ]
        }

        defaultTaskBarApps.forEach(appName => {
            let app = this.bp.apps.list[appName];
            if (app) {
                // console.log(`Adding default taskbar app: ${appName}`);
                installedTaskBarApps[appName] = {
                    app: app.app || appName,
                    context: app.context || 'default',
                    label: app.label || appName,
                    icon: app.icon || ''
                };
            } else {
                console.warn(`App ${appName} not found in desktop app list.`);
            }
        });
    }

    Object.keys(installedTaskBarApps).forEach(appName => {
        let savedApp = installedTaskBarApps[appName];
        //console.log('Adding taskbar app', appName);
        //console.log(this.bp.apps.list)
        // console.log('savedApp', appName, savedApp);
        let app = this.bp.apps.list[savedApp.id || appName];
        if (!app) {
            console.warn(`App ${appName} not found in desktop app list.`);
            return;
        }

        app.id = appName; // ensure the app has an id for taskbar
        app.app = app.app || appName; // ensure the app has an app property
        // create new app object with necessary properties
        let _app = {
            ...app
        }
        if (_app) {
            // console.log(`Adding default taskbar app: ${appName}`, _app);
            this.taskBar.saveItem(_app);
        } else {
            console.warn(`App ${appName} not found in desktop app list.`);
        }
    });

     $('.taskbar-container').css('display', 'flex').hide().fadeIn({ easing: 'linear', duration: 555 });
  }
}