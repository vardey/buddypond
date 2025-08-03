export default function handleAuthentication() {
        const api = this.bp.apps.client.api;
        const localToken = localStorage.getItem('qtokenid');
        const me = localStorage.getItem('me');
        if (!localToken) {
            $('#welcome').show();
            return;
        };
        // console.log('localToken', localToken, me);
        api.verifyToken(me, localToken, async (err, data) => {
            if (err) {
                console.error('Failed to verify token:', err);
                $('.password').show();
                $('.loginForm .error').text('Failed to authenticate buddy');
                return;
            }
            console.log('verified token', data);
            if (data.success) {
                this.bp.connected = true;
                if (!window.discordView) {
                    await this.bp.open('buddylist');
                } else {
                    await this.bp.open('buddylist', {
                        openDefaultPond: false,
                        showBuddyList: false
                    });

                }
                // A pre-existing token was found and verified, emit the auth event
                this.bp.emit('auth::qtoken', { qtokenid: localToken, me: me, hasPassword: data.user.hasPassword });
                $('.loggedIn').flexShow();
                $('.loggedOut').flexHide();
                if (!data.user.hasPassword) {
                    this.bp.open('pincode');
                }
                // close the welcome window
                // Remark: May be null here, why? already closed or not initialized?
                if (this.win && this.win.close) {
                    this.win.close();
                }
            } else {
                $('.loginForm .error').text('Failed to authenticate buddy');
                $('.password').show();
                console.error('Failed to authenticate buddy:');
            }
        });

    }