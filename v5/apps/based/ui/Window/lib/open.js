export default function open() {
    console.log('Window open:', this.id, this.title, this.app, this.type, this.context);
    // set focus to this window ( first )
    this.focus();

    try {
        // onOpen may have additional focus events
        this.onOpen(this);
    } catch (err) {
        console.error(err);
    }
    // TODO: save the window state ???
    // ???? this.parent.appendChild(this.container);

    if (this.bp.isMobile()) {
        this.windowManager.minimizeAllWindows(true);
        this.maximize();
    }

    if (window.discordView) {
        // this.windowManager.minimizeAllWindows(true);
        this.maximize();
    }

    this.bp.emit('window::open', this);

    // console.log('Window opened:', this);
    let _app = {
        id: this.id,
        app: this.app,
        label: this.title,
        icon: this.icon,
        // app: this.app,
        type: this.type,
        context: this.context
    };
    // console.log('openWindow openItem', _app);
    this.bp.apps.ui.windowManager.taskBar.openItem(_app);

    // add the items to this.bp.apps.ui.recentApps
    this.bp.apps.ui.recentApps = this.bp.apps.ui.recentApps || this.bp.settings.recentApps || [];

    // remove items with the same id if already exists
    this.bp.apps.ui.recentApps = this.bp.apps.ui.recentApps.filter(app => app.id !== this.id);

    this.bp.apps.ui.recentApps.unshift({
        id: this.id,
        app: this.app,
        label: this.label || this.title,
        icon: this.icon,
        type: this.type
    });

    // update the recentApps localStorage
    this.bp.apps.ui.recentApps = this.bp.apps.ui.recentApps.slice(0, 10); // keep only the first 10 items
    this.bp.set('recentApps', this.bp.apps.ui.recentApps);

    // update the url bar push state with app id
    // modify the url to include the app id
    // load app data to find any aliases
    let appData = this.bp.apps.desktop.appList[this.id];
    let pushStateId = this.id;
    if (appData && appData.alias) {
        // get the first entry in the alias array
        let alias = appData.alias[0];
        pushStateId = alias; // use the id if it exists, otherwise use the alias string
    }

    // history.pushState({ appId: pushStateId }, this.title, `/app/${pushStateId}`);
    DelayedPushState.push({ appId: pushStateId }, this.title, `/app/${pushStateId}`);

}
