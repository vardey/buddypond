export default function createBuddyListWindow() {

    // calculate right side of screen
    let x = window.innerWidth - 250;

    let buddyListWindow = this.bp.apps.ui.windowManager.createWindow({
        app: 'buddylist',
        type: 'buddylist-profile',
        title: 'Buddy List',
        icon: '/desktop/assets/images/icons/icon_profile_64.webp',
        id: 'buddylist',
        parent: this.bp.apps.ui.parent,
        width: 250,
        height: 500,
        x: x,
        y: 50,
        onOpen: () => {

            // Remark: We seeing a race condition where the input field is not focusable
            // Most likely due to element being hidden / shown
            // We hooked into window focus events and everything appeared OK in regards to conflicting focus() calls
            // The issue is most likely due to the element being hidden
            // This still doesn't work as intended since the element might actually be hidden
            // TODO: find a better way to handle this
            function focusOnInput() {
                const $loginInput = $('.loginForm input[name="username"]');
                console.log('focusOnInput: Found elements:', $loginInput.length, $loginInput);

                // If the element doesn’t exist, retry after a delay
                if ($loginInput.length === 0) {
                    console.log('Input not found, retrying in 100ms');
                    setTimeout(focusOnInput, 100);
                    return;
                }

                // Check if the element is focusable
                const input = $loginInput[0]; // Get the raw DOM element
                const isFocusable = input.offsetParent !== null && // Visible in the DOM
                    !input.disabled && // Not disabled
                    input.tabIndex !== -1 && // Focusable via tab
                    getComputedStyle(input).visibility !== 'hidden' && // Not hidden
                    getComputedStyle(input).display !== 'none'; // Not display: none

                if (!isFocusable) {
                    console.log('Input is not focusable yet, retrying in 100ms', {
                        isVisible: input.offsetParent !== null,
                        isEnabled: !input.disabled,
                        tabIndex: input.tabIndex,
                        visibility: getComputedStyle(input).visibility,
                        display: getComputedStyle(input).display
                    });
                    setTimeout(focusOnInput, 100);
                    return;
                }

                // Attempt to focus and verify
                $loginInput.focus();
                setTimeout(() => {
                    if (document.activeElement === input) {
                        console.log('Focus successful on:', input);
                    } else {
                        console.warn('Focus failed, active element is:', document.activeElement);
                        // Optionally retry
                        setTimeout(focusOnInput, 100);
                    }
                }, 0); // Check focus in the next tick
            }
            // focusOnInput();
            // if we call this in console after load, it works
            $('.loginForm input[name="username"]').focus();

        },
        onClose: () => {
            this.opened = false;
            // disconnect from websocket server
            if (this.client) {
                this.client.disconnect();
                this.client = null;
            }
            this.bp.connected = false;
        }
    });

    return buddyListWindow;

}
