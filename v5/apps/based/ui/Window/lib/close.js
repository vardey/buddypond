export default function close() {

    if (this.parent) {
        // check first to see if child is in parent
        if (this.container.parentElement && this.container.parentElement === this.parent) {
            this.parent.removeChild(this.container);
        }
    } else {
        this.container.parentElement.removeChild(this.container);
    }

    // check to see if this is an iframe and remove event listener
    if (this.content && this.content.contentWindow) {
        this.content.contentWindow.removeEventListener('message', this.receiveMessage.bind(this), false);
    }
    if (this.content) {
        if (this.content.parentNode) {
            this.content.parentNode.removeChild(this.content);
        }
        this.content = null;
    }

    // check to see if no more windows
    // TODO: remove this code from Window.js class ( it should not know about menubar )
    // if window count is 0 get the menubar-set-window-as-background element and add disabled class
    let windowCount = this.windowManager.windows.length;
    if (windowCount === 0) {
        let el = document.getElementById('menubar-set-window-as-background');
        if (el) {
            el.classList.add('disabled');
        }
    }
    // console.log('removeWindow', this.id);
    this.windowManager.removeWindow(this.id);


    if (this.windowManager.taskBar) {
        // remove the chat window from the taskbar
        this.windowManager.taskBar.closeItem(this.id);
    }

    // TODO: save the window state ??? removeWindow could do it..?

    this.onClose(this);
    this.bp.emit('window::close', this);

    if (this.bp.isMobile()) {
        // this.minimizeAllWindows(true);
        //this.windowManager.arrangeVerticalStacked();
        setTimeout(() => {
            // this.windowManager.arrangeVerticalStacked();
        }, 100);
    }

    // clear the current pushState
    // history.pushState({}, '', '/');
    if (typeof DelayedPushState !== 'undefined') {
      DelayedPushState.push({}, '', '/');
    }

    if (this.bp.isMobile()) {
        // if mobile, check to see if there are any other windows open
        // if so, restore the first one
        if (this.windowManager.windows.length > 0) {
            let firstWindow = this.windowManager.windows[0];
            if (firstWindow) {
                firstWindow.restore();
            }
        }
    }

}
