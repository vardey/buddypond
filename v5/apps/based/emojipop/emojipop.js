export default class EmojiPop {
    constructor(bp, options = {}) {
        this.bp = bp;
        this.options = options;
        return this;
    }

    async init() {
        return 'loaded EmojiPop';
    }

    async open () {

        if (window.discordView) {
            this.bp.alert(`Emoji Pop is currently not available in Discord Activities.<br/>Please visit <a class="open-link" target="_blank" href="https://buddypond.com/app/emoji-pop">BuddyPond</a> to play Emoji Pop.`, {
                title: 'Sorry!'
            });
            return;
        }

        let win = this.bp.window(this.window());
        win.maximize();
        return win;
    }

    window () {
        return {
            id: 'emojipop',
            title: 'Emoji Pop',
            icon: 'desktop/assets/images/icons/icon_emojipop_64.webp',
            x: 250,
            y: 75,
            width: 600, // Increased width for two-column layout
            height: 400,
            minWidth: 400,
            minHeight: 300,
            parent: $('#desktop')[0],
            iframeContent: 'https://games.gameboss.com/emojipop/index.html?lang=en',
            resizable: true,
            minimizable: true,
            maximizable: true,
            closable: true,
            focusable: true,
            maximized: false,
            minimized: false,
            onclose: () => {
                // this.bp.apps.ui.windowManager.destroyWindow('motd');
            }
        }
    }
}