export default function maximize({ fullWindow = false } = {}) {

    // offset the top position by $('.desktop-menu-bar').height()
    // so that on smaller devices the window is not hidden behind the menubar
    if (this.isMaximized) {
        if (this.bp.isMobile()) {
            this.container.style.width = "100vw";
            this.container.style.height = 'calc(var(--vh) * 90)';
            this.container.style.top = "0";
            this.container.style.left = "0";

        } else if (window.discordView) {

            if (fullWindow) {
                this.container.style.width = "calc(100vw - 75px)";
                this.container.style.height = 'calc(var(--vh) * 95)';
                this.container.style.top = "20px";
                this.container.style.left = "75px";
            } else {
                this.container.style.width = "90vw";
                this.container.style.height = 'calc(var(--vh) * 90)';
                this.container.style.top = "0";
                this.container.style.left = "75";

            }

        } else {
            this.container.style.width = `${this.width}px`;
            this.container.style.height = `${this.height}px`;
            this.container.style.top = "50px";
            this.container.style.left = "50px";
            this.isMaximized = false;

        }
    } else {
        let normalMenuBarHeight = 21;
        let currentMenuBarHeight = $('.desktop-menu-bar').height() || normalMenuBarHeight;
        let diff = currentMenuBarHeight - normalMenuBarHeight;
        diff += (normalMenuBarHeight + 2); // add 2px for border
        let pixelOffset = diff + 'px';
        if (this.bp.isMobile()) {
            this.container.style.width = "100vw";
            this.container.style.height = 'calc(var(--vh) * 90)';
            this.container.style.top = "0";
            this.container.style.left = "0";
        } else if (window.discordView) {


            if (fullWindow) {
                this.container.style.width = "100vw";
                this.container.style.height = 'calc(var(--vh) * 95)';
                this.container.style.top = "20px";
                this.container.style.left = "0";

            } else {
                this.container.style.width = "60vw";
                this.container.style.height = 'calc(var(--vh) * 95)';
                this.container.style.top = "20px";
                this.container.style.left = "40vw";
            }

        } else {
            this.container.style.width = "100vw";
            this.container.style.height = "calc(100vh - 104px)";
            this.container.style.top = pixelOffset;
            this.container.style.left = "0";
        }
        this.isMaximized = true;
    }
    // TODO: save the window state

}