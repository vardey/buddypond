import bindUIEvents from "./lib/bindUIEvents.js";
import handleAuthentication from "./lib/handleAuthentication.js";
export default class Welcome {
    constructor(bp, options = {}) {
        this.bp = bp;
        this.options = options;
        return this;
    }

    async init() {
        this.html = await this.bp.load('/v5/apps/based/welcome/welcome.html');
        await this.bp.load('/v5/apps/based/welcome/welcome.css');
        this.affirmations = await this.bp.importModule('affirmations');

        return 'loaded Welcome';
    }

    async open() {

        this.win = await this.bp.window(this.window());
        // this should be handled globally ( if possible )
        $('.loggedIn', this.win.content).hide();
        $('.loggedOut', this.win.content).show();
        this.bindUIEvents();
        // check if the user is already authenticated with qtoken
        this.handleAuthentication();

        // focus on the username input field
        $('.welcomeForm input[name="username"]', this.win.content).focus();

        return this.win;

    }

     window() {
        return {
            id: 'welcome',
            title: 'Welcome Buddy',
            icon: 'desktop/assets/images/icons/icon_buddy-frog_64.png',
            position: 'center',
            parent: $('#desktop')[0],
            width: 850,
            height: 600,
            content: this.html,
            resizable: true,
            closable: true,
            onClose: () => {
                this.win = null;
            }
        }
    }
}

Welcome.prototype.bindUIEvents = bindUIEvents;
Welcome.prototype.handleAuthentication = handleAuthentication;