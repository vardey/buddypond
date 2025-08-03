export default function logout() {
    // set status to online
    $('.loginButton').prop('disabled', false);
    $('.loginButton').removeClass('disabled');
    $('#menu-bar-coin-balance').text('0');

    this.client.setStatus(this.bp.me, {
        status: 'offline'
    }, (err, re) => {
        console.log('buddypond.setStatus', err, re);
        // close any open chat windows
        // $('.chatWindow').remove(); // maybe, they could stay open as well
        this.bp.apps.ui.windowManager.windows.forEach(window => {
            console.log('closing window', window);
            if (window.type === 'buddy' || window.type === 'pond') {
                // console.log('closing chat window', window.id);
                window.close();
            }
        });
        // iterate through all windows and close any that are chat windows
        // disconnect the client
        // this.bp.apps.client.logout();
        $('.password').val('');
        $('.loggedIn').flexHide();
        $('.loggedOut').flexShow();

        this.data.profileState = null;
        this.bp.play('desktop/assets/audio/GOODBYE.wav');
        // TODO can we now remove bp.apps.client.logout()?
        this.bp.apps.client.logout();
        this.client.disconnect();
        this.bp.connected = false;
        this.client = null;
        // clear out the local .data scope
        // TODO: only declare this once ( code is repeated in constructor )
        this.data = {
            processedMessages: {},
            profileState: {
            },
            activeUsersInContext: {},
            activeUsers: [],
            activePonds: [],
            avatarCache: new Map()
        };
        // empty the buddylist
        $('.buddylist').empty();

        // hide any .dialog
        $('.dialog').remove();

    });
}