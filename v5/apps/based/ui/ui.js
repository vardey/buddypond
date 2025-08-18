// Remark: We may be able to remove UI and put all this logic in the desktop app
import WindowManager from "./Window/WindowManager.js";
import CountdownManager from "../ui/CountdownManager.js";
import LightBox from "./LightBox.js";
import showAlert from "./showAlert.js";

export default class UI {
    constructor(bp, options = {}) {
        this.bp = bp;

        this.bp.alert = showAlert.bind(this);
        let windowManagerOptions = {};
        windowManagerOptions.openWindow = this.bp.open.bind(this.bp),
        windowManagerOptions.window = options.window || {};
        windowManagerOptions.hideTaskBar = options.hideTaskBar;
        this.windowManager = new WindowManager(this, windowManagerOptions);
        this.bp.windows = this.windowManager.windows;
        // will re-load any previous stored metadata about windows
        // storage provider is defaulted to localStorage
        this.windowManager.loadWindows();

        options.parent = options.parent || document.body;

        // options.parent.classList.add('droparea');

        this.options = options;

        if (typeof options.fontAwesome !== 'boolean') {
            options.fontAwesome = true;
        }

        this.parent = options.parent;

        this.countdownManager = new CountdownManager(this.bp);
        // this.countdownManager.updateCountdowns();
        let that = this;
        this.bp.window = that.windowManager.createWindow.bind(that.windowManager);
        // console.log('UI initialized with options:', this.options);
        function setViewportHeight() {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
            const vw = window.innerWidth;
            document.documentElement.style.setProperty('--vw', `${vw}px`);
        }

        // Run on load and resize
        window.addEventListener('resize', setViewportHeight);
        setViewportHeight();

        return this;
    }

    async init() {

        // base CSS for ui, this can be themed in the future
        if (!this.options.noCSS) {
            this.bp.appendCSS('/v5/apps/based/ui/ui.css'); // no need to wait for CSS to load?
            if (this.bp.mode !== 'prod') {
                this.bp.appendCSS('/v5/apps/based/ui/mobile.css'); // no need to wait for CSS to load?
                this.bp.appendCSS('/v5/apps/based/ui/Window/Window.css'); // no need to wait for CSS to load?
                this.bp.appendCSS('/v5/apps/based/ui/Window/TaskBar.css'); // no need to wait for CSS to load?
                this.bp.appendCSS('/v5/apps/based/ui/Window/StartPanel.css'); // no need to wait for CSS to load?

            }
        }

        if (this.options.fontAwesome) {
            this.bp.appendCSS('/v5/vendor/font-awesome/css/fontawesome.css', false, true);
            this.bp.appendCSS('/v5/vendor/font-awesome/css/all.min.css', false, true);
        }

        // TODO: add these lines back after removing v4 completely ( as jQuery is already loaded in v4)
        if (!this.options.noZepto) {
            // If you need jQuery or another version of $
            // we have the ability to not load Zepto as $
            //await this.bp.appendScript('/v5/vendor/zepto.min.js');
        } else {
            //await this.bp.appendScript('/v5/vendor/jquery.min.js');

        }

        // await this.bp.appendScript('/desktop/assets/js/jquery.js');


        if (!this.options.noTabs) {
            // what happened here with config? we shouldn't need to reference host here,
            // TODO: check implementation of importModule with options
            let SimpleTabs = await this.bp.importModule(this.bp.config.host + '/v5/apps/based/ui/SimpleTabs.js', {}, false)
            this.Tabs = SimpleTabs.default;

        }

        await this.bp.appendScript('/v5/vendor/DateFormat.js');

        this.showLightBox = LightBox.bind(this);

        // bind common document events
        // TODO: move UI events to separate file
        let d = document;

        $(d).on('click', '.open-app', function (e) {
            e.preventDefault();
            let appName = $(this).data('app');
            let context = $(this).data('context');
            let type = $(this).data('type');
            // let output = $(this).data('output');
            // check to see if legacy app ( for now)
            bp.open(appName, { context, type });

        });

         $(d).on('click', function (e) {
            // console.log('document click', e);
            // if the click is outside of a lightbox, close it
         });

        $(d).on('click', '.open-link', async function (e) {
            e.preventDefault();
            let url = $(this).data('link');
            if (!url) {
                // check if tag has href attribute
                url = $(this).attr('href');
            }
            console.log('open-link ' + url);
            if (window.discordMode) {
                await window.discordSdk.commands.openExternalLink({
                    url: url
                });
                return;
            } else {
                window.open(url, '_blank');
            }
            return false;
        });

        return 'loaded ui';
    }

    async appendToElement(el) {
        console.log('appendToElement', this);
        let html = await fetchHTMLFragment('ui.html'); // TODO: might need root
        console.log(html);
        el.innerHTML = html;
        return 'hello ui';
    }

    async loadDocumentBody() {
        console.log('loadDocumentBody', this);
        let html = await this.bp.fetchHTMLFragment('/v5/apps/based/ui/ui.html'); // TODO: might need root
        console.log(html);
        $('body').append(html);
        //document.body.innerHTML = html;
        return 'hello ui';

    }

    toggleFullScreen() {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            document.documentElement.requestFullscreen();
        }
    }

}