export default function registerEventHandlers() {
    // console.log('BuddyList registerEventHandlers');
    this.bp.on('auth::qtoken', 'handle-auth-success', qtoken => this.handleAuthSuccess(qtoken));

    // On auth success, load user specific apps ( TODO: should pull from DB )
    this.bp.on('auth::qtoken', 'load-user-apps', qtoken => this.loadUserApps());

    // Generate default profile files ( TODO: don't run this each time, keep track on profile state if users generated default profile )
    this.bp.on('auth::qtoken', 'generate-default-profile-files', qtoken => {
        // give the app a moment to load messages and open windows before generating default profile
        // TODO: we could do this server-side instead
        setTimeout(() => {
            try {
                // alert('Generating default profile files');
                this.generateDefaultProfile(qtoken)

            } catch (err) {
                console.error('generate-default-profile-files', err);
            }
        }, 6000);

    });

    this.bp.on('buddylist-websocket::connected', 'update-buddylist-connected', ws => {
        // sets buddylist status to online
        $('.onlineStatusSelect').val('online');
        $('.loggedOut').flexHide();
        $('.loggedIn').flexShow();

        this.bp.apps.buddylist.client.wsClient.send(JSON.stringify({
            action: 'getCoinBalance',
            buddyname: this.bp.me,
            qtokenid: this.bp.qtokenid,
        }));

        //$('.loggedIn').addClass('show');
    });

    // Remark: This has been removed in favor of letting windows manage their own state
    // If the buddylist emits newMessages: true for a buddy, the window will open automatically calling getMessages
    //this.bp.on('client::websocketConnected', 'get-latest-messages', ws => this.getLatestMessages());

    // Removed: 9/17/2025, this appears to be legacy for V3 API ( before CF edge workers )
    // this.bp.on('profile::buddylist', 'process-buddylist', ev => this.processBuddylist(ev.data));

    this.bp.on('profile::buddy::in', 'render-or-update-buddy-in-buddylist', data => this.renderOrUpdateBuddyInBuddyList(data));
    this.bp.on('profile::buddy::out', 'remove-buddy-from-buddylist', data => {
        console.log('profile::buddy::out', data);
        const buddyName = data.name;
        let buddyListItem = $(`li[data-buddy="${buddyName}"]`, '.buddylist');
        console.log('buddyListItem', buddyListItem);
        buddyListItem.remove();
    });

    this.bp.on('profile::fullBuddyList', 'render-or-update-buddy-in-buddylist', data => {
        let buddylist = data.buddylist || {};

        // Legacy API support
        // check if buddylist is an array, if so convert to object
        if (Array.isArray(buddylist)) {
            buddylist = buddylist.reduce((acc, buddy) => {
                acc[buddy.buddy_id] = buddy;
                return acc;
            }, {});
        }

        console.log('profile::buddy::full_profile', buddylist);
        for (let b in buddylist) {
            let buddy = {
                name: b,
                profile: buddylist[b]
            }
            this.data.profileState = this.data.profileState || {};
            this.data.profileState.buddylist = this.data.profileState.buddylist || {};

            this.data.profileState.buddylist[b] = buddy.profile;
            console.log('renderOrUpdateBuddyInBuddyList', buddy);
            this.renderOrUpdateBuddyInBuddyList(buddy);
        }

        if (buddylist[this.bp.me]) {
            // for now...needs to change shape of server response to include root fields?
            if (buddylist[this.bp.me].profile_picture) {
                // console.log('setting profilePicture', buddylist[this.bp.me].profile_picture);
                this.data.profileState.profilePicture = buddylist[this.bp.me].profile_picture;
            }
            if (buddylist[this.bp.me].status) {
                // console.log('setting status', buddylist[this.bp.me].status);
                this.data.profileState.status = buddylist[this.bp.me].status;
            }
        }

        if (data.email) {
            this.data.profileState.email = data.email;
            // update the email input field
            $('.buddy_email').val(data.email);
        }

        if (typeof data.emailVerified === 'boolean') {
            this.data.profileState.emailVerified = data.emailVerified;
            // update the email verified checkbox
            // $('.buddy_email_verified').prop('checked', data.emailVerified);
            if (data.emailVerified) {
                $('.buddy_email_verified_text').html('Email Verified');
            } else {
                $('.buddy_email_verified_text').html('Email Not Verified');
            }
        }

        // iterate through all buddies and call renderOrUpdateBuddyInBuddylist

    });




    // Remark: removing buddy-in sound because Marak account is friends without everyone is is constantly triggering the sound
    // We'll have to be smarter about when to play sounds and limit the amount of BUDDY-IN a single buddy can trigger
    // total amount of buddy-in sounds per time window ( in case of 100s of buddies, etc )
    // this.bp.on('profile::buddy::in', 'play-buddy-in-sound', data => bp.play('desktop/assets/audio/BUDDY-IN.wav'));

    // Remark: buddy-out sound disabled until new client connection logic with backend is fully tested 
    //         ( was triggering too many sounds too often )
    //this.bp.on('profile::buddy::out', 'play-buddy-out-sound', data => bp.play('desktop/assets/audio/BUDDY-OUT.wav'));
    this.bp.on('buddy::message::processed', 'play-im-sound', data => {
        if (data.noAlert) {
            // don't play sound if noAlert is set by server
            return;
        }
        // only play sounds for recent messages
        let messageTime = new Date(data.ctime);
        let now = new Date().getTime();
        //console.log("messageTime", messageTime);
        //console.log("now", new Date());
        if (now - messageTime.getTime() < 5000) {
            bp.play('desktop/assets/audio/IM.wav');
        }
    });

    this.bp.on('profile::buddy::newmessage', 'open-chat-window', data => {
        // open the new chat window only if not already open
        let windowId = `messages/` + data.name;
        let win = this.bp.apps.ui.windowManager.getWindow(windowId);
        if (!win) {
            this.openChatWindow(data)
        }
    });

    // Remark: Not used? Should be added?
    this.bp.on('profile::buddy::newmessage', 'mark-messages-as-read', data => this.buddyReadNewMessages(data));

    this.bp.on('profile::buddy::calling', 'start-call', data => {
        // legacy BP API
        // console.log("profile::buddy::calling", data);
        desktop.app.videochat.startCall(false, data.name, function (err, re) {
            console.log('startCall callback', err, re);
        });
    });

    // buddylist should not respond to auth::logout 
    // this.bp.on('auth::logout', 'logout', () => this.logout());

    this.bp.on('profile::status', 'update-profile-status', status => {
        this.buddyServerClient.setStatus(this.bp.me, { status }, (err, re) => {
            if (err) {
                console.error('error setting status', err);
            }
            // console.log('setStatus', err, re);

            if (status === 'signout') {
              this.logout()
            }
        });
        /*
        buddypond.setStatus(this.bp.me, { status }, function(err, re){
            // console.log('errrrr', err, re);
        });
        */

    });

    this.bp.on('buddy::messages', 'render-chat-message', data => this.handleChatMessages(data));
    this.bp.on('buddy::sendMessage', 'send-buddy-message-to-server', data => this.sendMessageToServer(data));
    // this.bp.on('pond::sendMessage', 'send-pond-message-to-server', data => this.sendPondMessageToServer(data));

    //this.bp.on('buddy::sendMessage', 'process-buddymessage-bs', data => this.bp.apps.buddyscript.parseCommand(data.text));
    //this.bp.on('pond::sendMessage', 'process-pondmessage-bs', data => this.bp.apps.buddyscript.parseCommand(data.text));

    // remote isTyping event from server
    // TODO: move to separate file
    this.bp.on("buddy::isTyping", "show-is-typing-message", message => {
        // console.log('show-is-typing-message', message);
        // TODO: move to separate file
        // TODO: move this to a separate file / function
        // Handling typing message display
        if (message.isTyping === true) {
            // check to see if message.from is the same as the current user
            // if so, ignore the message
            if (message.from === this.bp.me) {
                return;
            }

            // check the ctime of the message
            // console.log("isTyping message", message);
            let messageTime = new Date(message.ctime);
            // console.log("messageTime", messageTime.getTime());
            let now = new Date().getTime();
            let windowId;
            if (message.type === 'buddy') {
                if (message.to === this.bp.me) {
                    windowId = `messages/${message.from}`;
                } else {
                    windowId = `messages/${message.to}`;
                }
            }

            if (message.type === 'pond') {
                // windowId = `pond_message_-${message.to}`;
                windowId = 'pond-chat';
            }

            let chatWindow = this.bp.apps.ui.windowManager.getWindow(windowId);
            // don't process isTyping messages over 3 seconds old
            if (now - messageTime.getTime() > 3000) {
                // console.log("isTyping message too old", message);
                // return;
            }

            // console.log('typing message', message);

            let typingIndicatorId = `typing-${message.from}`;
            let typingMessage = `${message.from} is typing...`;

            if (message.type === 'pond') {
                // we need to determine if the current open pond aim-messages-container matches the message.to
                if (chatWindow.currentActiveContext !== message.to) {
                    console.log('pond chat window is not active for this pond', message.to);
                    return;
                }
            }


            // Check if the typing indicator for this user already exists
            let typingIndicator = $(`.aim-typing span[data-user="${message.from}"]`, chatWindow.content);
            // console.log('typingIndicator', typingIndicator);
            // console.log('typingMessage', typingMessage);
            if (typingIndicator.length === 0) {
                // If it does not exist, create a new span and append it to the .aim-typing area
                typingIndicator = $('<span></span>')
                    .attr('data-user', message.from)
                    .text(typingMessage)
                    .appendTo($('.aim-typing', chatWindow.content));
            } else {
                // If it exists, just update the text
                typingIndicator.text(typingMessage);
            }

            // Clear any existing timeout for this user
            // console.log("CLEARING OLD TIMER")
            if (this.showingIsTyping[typingIndicatorId]) {
                clearTimeout(this.showingIsTyping[typingIndicatorId]);
            }

            // console.log("CREATING NEW TIMER")
            // Set a new timeout to remove the typing message after very short pause
            // since there already is a delay from the server
            this.showingIsTyping[typingIndicatorId] = setTimeout(() => {
                typingIndicator.remove();
            }, 500);
            return;
        }
    })

    // local typing event TOOD: better name
    // when buddy is typing send a message to the ws server
    this.bp.on('buddy::typing', 'send-typing-message-to-server', data => {
        // we don't want to spam typing messages, so we will only send a message every 2 seconds
        this.lastTypingMessage = this.lastTypingMessage || 0;
        if (new Date().getTime() - this.lastTypingMessage < 2000) {
            // return;
        }
        this.lastTypingMessage = new Date().getTime();
        // console.log('buddy::typing', data);

        let chatId = '';

        if (data.type === 'buddy') {
            let buddyNames = [data.from, data.to].sort();
            chatId = 'buddy/' + buddyNames.join('/');
        }

        if (data.type === 'pond') {
            chatId = 'pond/' + data.to;
        }

        bp.apps.client.sendWsMessage(chatId, {
            action: 'send',
            chatId: chatId,
            buddyname: buddypond.me,
            qtokenid: buddypond.qtokenid,
            message: {
                ...data,
                chatId,
                isTyping: true
            }
        });
        /*
        if (data.type === 'pond') {
            this.sendPondMessageToServer(data, false);
        } else {
            this.sendMessageToServer(data, false);
        }
        */
        // this.bp.apps.client.sendMessage({ id: uuid(), method: 'sendMessage', data: data });


    });

    // TODO: this handler could instead bind to bp.apps.system.messages
    // a System allows for sending and receiving messages to a sequence of handlers
    /*
    */
    // the buddylist registers with the "messages" system
    // in order to receive messages from other systems
    /*
    // this will get or create a system called "messages"
    // the send and recieve handlers should get ordered in the order they are registered
    // unless the order is specified, which should put the system in the correct order by number values and then undefined last
    bp.apps.system.registerSystem('messages', {
        registrant: 'buddylist',
        send: {
            // since send is missing name and handler, it will be ignored
        },
        receive: {
            name: 'buddylist-processes-messages',
            order: 2, // we can stack multiple systems in order
            handler: (message) => {
                console.log('buddylist-processes-messages', message);
            }
        }
    });
    // this event can be anywhere, doesn't have to be in the buddylist
    // prob should be though :-D
    // by sending the events to the messages system, they will 
    // go through the processing chain ( if any exists for that system )
    // and then we recieved via the receive handler
    this.bp.on(
        'buddy::messages',
        'send-messages-to-messages-system',
        data => this.bp.apps.systems.messages.send({
            name: 'buddylist-processes-messages',
            data: data
    }));
   // example of another app which filters messages

    bp.apps.system.registerSystem('messages', {
        registrant: 'shorten-text',
        send: {
            // since send is missing name and handler, it will be ignored
        },
        receive: {
            name: 'shorten-text',
            order: 1, // we can stack multiple systems in order
            handler: (message) => {
                console.log('shorten text', message);
                return message.text.substr(0, 1);
            }
        }
    });
    */
    this.bp.on('buddylist-websocket::reward', 'update-local-coin-balance', data => {
        // TODO: move this into rewards app
        //$('#menu-bar-coin-balance').text(data.message.newBalance);
        if (!data.success) {
            console.log(data.message);
            return;
        }
        rollToNumber($('#menu-bar-coin-balance'), data.message.newBalance)

        // TODO: better condition to check if portfolio app is loaded and ready
        if (this.bp.apps.portfolio && this.bp.apps.portfolio.portfolioWindow && this.bp.apps.portfolio.portfolioWindow.content && this.bp.apps.portfolio.portfolioData) {

            this.bp.apps.portfolio.updateCoinRow(data.message.symbol, {
                symbol: data.message.symbol,
                amount: data.message.newBalance,
                available: data.message.newBalance,
                price: 0.001,
                cost: 0.001 * data.message.newBalance
            });

            let coinSendSelector = $('#coin-send-name');
            let coinSendBalance = $('#current-balance');

            // if coinSendSelector value is "GBP"
            if (coinSendSelector.val() === 'GBP') {
                // set the coin balance to the new balance
                // window.rollToNumber(coinSendBalance, data.message.newBalance)
                const formattedValue = data.message.newBalance.toLocaleString('en-US');

                coinSendBalance.text(formattedValue);
            }
        }
    });

    this.bp.on('buddylist-websocket::coinBalance', 'update-local-coin-balance', async (data) => {
        console.log('buddylist-websocket::coinBalance', data);
        if (typeof data.message.balance === 'number') {
            rollToNumber($('#menu-bar-coin-balance'), data.message.balance)
        } else {
            this.faucetAttempts++;
            // should work on 1, adds safe guard in case service is down
            // we don't want to spam the faucet service or getCoinBalance
            if (this.faucetAttempts < 3) {
                // request initial coin balance, null indicates no portfolio entry for GBP
                // if no portfolio entry, request the default coin allocations
                await this.requestDefaultCoinAllocations();
                // make another request to get the coin balance
                this.bp.apps.buddylist.client.wsClient.send(JSON.stringify({
                    action: 'getCoinBalance',
                    buddyname: this.bp.me,
                    qtokenid: this.bp.qtokenid,
                }));
            } else {
                console.warn('BuddyList: Too many faucet attempts, not requesting balance again this session');
            }

        }

    })
}

function rollToNumber($el, value) {
    // Format number with commas
    const formattedValue = value.toLocaleString('en-US');
    const digits = formattedValue.split('');

    if (bp.isMobile()) {
        $el.text(formattedValue);
        return;
    }

    const existingDigits = $el.find('.odometer-digit');

    // If digit count changed (new commas or digit length), rebuild fully
    if (existingDigits.length !== digits.filter(d => d !== ',').length) {
        $el.empty();
        digits.forEach(d => {
            if (d === ',') {
                $el.append('<span class="odometer-comma">,</span>');
            } else {
                const digitContainer = $('<div class="odometer-digit"></div>');
                const inner = $('<div class="odometer-digit-inner"></div>');

                for (let i = 0; i <= 9; i++) {
                    inner.append(`<span>${i}</span>`);
                }

                digitContainer.append(inner);
                $el.append(digitContainer);
            }
        });
    }

    // Animate each digit to its new position
    let digitIndex = 0;
    digits.forEach((d, index) => {
        if (d === ',') return;

        const digitContainer = $el.find('.odometer-digit').eq(digitIndex);
        const inner = digitContainer.find('.odometer-digit-inner');

        // Apply transition
        inner.css({
            'transition': 'transform 0.5s ease-in-out',
            'transform': `translateY(-${d * 1}em)`
        });

        digitIndex++;
    });
}
