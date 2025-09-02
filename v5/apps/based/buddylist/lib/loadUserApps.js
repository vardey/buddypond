export default function loadUserApps() {
    console.log('Loading user apps...');
    // defer loading of default chat window bar apps
    setTimeout(async () => {
      /* Instead of parrallel request, we load them sequentially to reduce load client
      await Promise.all([
      ]);
      */
      await this.bp.load('spellbook');
      await this.bp.load('coin');
      await this.bp.load('soundrecorder');
      await this.bp.load('camera');
      await this.bp.load('dictate');
      await this.bp.load('chalkboard');
      await this.bp.load('paint');
      await this.bp.load('painterro');
      await this.bp.load('minipaint');
      await this.bp.load('say');
    }, 3000);


    // TODO: load from saved profile
    if (this.bp.me === 'Marak') { // TODO: admin rbac checks
        // install Admin if not already installed
        let installedApps = this.bp.settings.apps_installed || {};
        console.log('installedApps', installedApps);
        if (!installedApps['admin']) {
            this.bp.apps.desktop.addApp('admin');
        }
        if (typeof window.arrangeDesktop === 'function') {
          window.arrangeDesktop();
        }
    }
}