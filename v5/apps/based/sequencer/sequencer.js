export default class Sequencer {
    constructor(bp, options = {}) {
        this.bp = bp;
        this.options = options;
        return this;
    }

    async init() {
        return 'loaded Sequencer';
    }

    async open() {

        if (window.discordView) {
            this.bp.alert(`Sequencer is currently not available in Discord Activities.<br/>Please visit <a class="open-link" target="_blank" href="https://buddypond.com/app/sequencer">BuddyPond</a> to use the Sequencer.`, {
                title: 'Sorry!'
            });
            return;
        }

        let win = this.bp.window(this.window());
        win.maximize();
        return win;
    }

    window() {

        let sequencerProxy = 'http://192.168.200.59:7002';
        sequencerProxy = 'https://sequencer.buddypond.com';
        let iframeUrl = sequencerProxy + '/';

        return {
            id: 'sequencer',
            title: 'Sequencer',
            icon: 'desktop/assets/images/icons/icon_sequencer_64.png',
            x: 250,
            y: 75,
            width: 600, // Increased width for two-column layout
            height: 400,
            minWidth: 400,
            minHeight: 300,
            parent: $('#desktop')[0],
            iframeContent: iframeUrl,
            resizable: true,
            minimizable: true,
            maximizable: true,
            closable: true,
            focusable: true,
            maximized: false,
            minimized: false,
            onClose: () => {
            }
        }
    }
}