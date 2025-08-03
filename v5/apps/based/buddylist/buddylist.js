// TODO: decouple Buddylist class from Message Class
// TODO: formalize Message class

import processBuddylist from "./lib/processProfile.js";
import renderOrUpdateBuddyInBuddyList from "./lib/renderOrUpdateBuddyInBuddyList.js";
import createChatMessageElement from "./lib/message/createChatMessageElement.js";
import renderChatMessage from "./lib/message/renderChatMessage.js";
import renderBuddyRequests from "./lib/renderBuddyRequests.js";
import buddylistUIEvents from "./lib/buddylistUIEvents.js";
import openChatWindow from "./lib/openChatWindow.js";
import generateDefaultProfile from "./lib/generateDefaultProfile.js";
import requestDefaultCoinAllocations from "./lib/requestDefaultCoinAllocations.js";
import defaultChatWindowButtons from "./lib/defaultChatWindowButtons.js";
import sortBuddyList from "./lib/sortBuddyList.js";
// buddylist context menu
import showContextMenu from "./lib/showContextMenu.js";
// chat message context menu
import bindMessageContextMenu from "./lib/message/bindMessageContextMenu.js";
import createMessageContextMenu from "./lib/message/createMessageContextMenu.js";
import loadUserApps from "./lib/loadUserApps.js";

import sendMessageHandler from "./lib/message/sendMessageHandler.js";
import showCard from "./lib/message/showCard.js";
import scrollToBottom from "./lib/message/scrollToBottom.js";
import forbiddenNotes from "./lib/forbiddenNotes.js";

import registerEventHandlers from "./lib/registerEventHandlers.js";
import createBuddyListWindow from "./lib/createBuddyListWindow.js";
import logout from "./lib/logout.js";

import defaultAvatarSvg from "./lib/buddy/defaultAvatarSvg.js";

// new ws api
import Client from './lib/ws/Client.js';

// TODO: why does client care about making UUID at all?
// this is the responsibility of the server
// TODO: remove uuid(), is most likely used for local render of message before server confirms ( which is removed atm )
function uuid() {
    return new Date().getTime();
}

export default class BuddyList {
    constructor(bp, options = {}) {
        this.bp = bp;
        this.data = {
            processedMessages: {},
            profileState: {
                me: null,
                status: null, // are these used?
                profilePicture: null, // are these used?
                updates: {}
            },
            avatarCache: new Map()
        };

        this.defaultPond = 'Buddy';
        this.subscribedBuddies = [];
        this.subscribedPonds = [];
        this.options = options;


        // ensures autocomplete options are always used regardless of entry
        if (bp.apps.buddyscript && bp.apps.buddyscript.commands) {
            this.options.autocomplete = bp.apps.buddyscript.commands;
        }

        this.showedHelp = false;

        // alias global logout to the buddylist logout
        // buddylist logout will handle both buddylist and message logout
        this.bp.logout = this.logout.bind(this);

        // pull in the default button
        this.options.chatWindowButtons = this.options.chatWindowButtons || defaultChatWindowButtons(this.bp);

        // add any active buttons that have been added in this session
        // add the this.bp.apps.desktop.enabledChatWindowButtons array to this.options.chatWindowButtons

        let enabledChatWindowButtons = this.bp.apps.desktop.enabledChatWindowButtons;
        // iterate through each button and fetch the appList data.chatButton data ( hydrate the button )
        if (enabledChatWindowButtons && Array.isArray(enabledChatWindowButtons)) {
            enabledChatWindowButtons.forEach(buttonMeta => {
                let app = this.bp.apps.desktop.appList[buttonMeta.name];
                if (app && app.chatButton) {
                    this.options.chatWindowButtons.push(app.chatButton);
                }
            });
        }

        this.opened = false;
        this.showingIsTyping = this.showingIsTyping || {};

        this.activeMessageContextMenu = null;

        this.faucetAttempts = 0;

    }

    async init() {
        // Add event when user closes browser window or navigates away
        window.addEventListener('beforeunload', (event) => {
            // Show warning message
            //event.preventDefault();
            //event.returnValue = "Are you sure you want to leave? Your status will be set to offline.";
            // Attempt to set status to offline (you may need a sync alternative)
            // if page has quickly refreshed, client might be defined yet or connected
            if (this.client) {
                this.client.setStatus(this.bp.me, {
                    status: 'offline'
                }, function (err, re) {
                    console.log('buddypond.setStatus', err, re);
                });

            }
            //return event.returnValue;
        });
        // this.bp.load('ramblor');

        await this.bp.appendScript('/v5/apps/based/buddylist/vendor/marked.min.js');

        // TODO: we can load this lazier
        this.bp.vendor.dicebear = await this.bp.importModule('/v5/apps/based/buddylist/vendor/dicebear.core.js', {}, false);
        this.bp.vendor.dicebearAvatars = await this.bp.importModule('/v5/apps/based/buddylist/vendor/dicebear.identicon.js', {}, false);
        await bp.load('emoji-picker');
        await bp.load('card');

        //console.log('LOADED dicebear', this.dicebear);
        //console.log('LOADED dicebearAvatars', this.dicebearAvatars);

        this.bindMessageContextMenu();
        this.forbiddenNotes = forbiddenNotes;

    }

    async open(config = { type: 'buddylist-profile' }) {
        // buddylist supports (2) window types for bp.open('buddylist, { type: 'buddylist-profile' })
        // 'buddylist-profile' - the default buddylist window
        // 'buddylist-chat' - a chat window
        // console.log('BuddyList open config', config)

        if (typeof config.type !== 'string') {
            config.type = 'buddylist-profile';
        }

        if (config.openDefaultPond === false) {
            this.openDefaultPond = false;
        }

        if (window.discordView) {
           this.openDefaultPond = false;
        }

        if (config.type === 'buddylist-profile') {

            // TODO: have the ability to close and re-open the buddylist gracefully
            const htmlStr = await this.bp.fetchHTMLFragment('/v5/apps/based/buddylist/buddylist.html');
            this.messageTemplateString = await this.bp.fetchHTMLFragment('/v5/apps/based/buddylist/message.html');
            this.bp.appendCSS('/v5/apps/based/buddylist/buddylist.css');
            this.bp.appendCSS('/v5/apps/based/buddylist/messages.css');

            if (this.opened) {
                // console.log('BuddyList already opened, focusing existing window');
                if (!this.buddyListWindow) {
                    const buddyListWindow = this.createBuddyListWindow();
                    buddyListWindow.content.appendChild(this.createHTMLContent(htmlStr));
                    this.buddyListWindow = buddyListWindow;
                }
                this.buddyListWindow.open();
                this.bp.apps.ui.windowManager.focusWindow(this.buddyListWindow);
                this.buddyListWindow.restore();
                $('.loginForm input[name="username"]').focus();
                return 'buddylist already open';
            }

            this.opened = true;


            // this.bp.apps.themes.applyTheme(this.bp.settings.active_theme);

            // await this.bp.importModule('https://cdn.jsdelivr.net/npm/uuid@11.0.3/+esm', {}, false)

            // loads affirmations messages via the affirmations app
            let affirmations = await this.bp.importModule('affirmations');

            if (config.showBuddyList !== false) {
                const buddyListWindow = this.createBuddyListWindow();
                buddyListWindow.content.appendChild(this.createHTMLContent(htmlStr));
                this.buddyListWindow = buddyListWindow;
            }


            if (this.eventsBound !== true) {
                // TODO: it would be better if we unregister events on close
                // and left this close to re-bind on open
                this.registerEventHandlers();
            }

            this.buddylistUIEvents();

            if (!this.client) {
            }
            this.handleAuthentication();

            this.eventsBound = true;


            return 'hello buddyList';
        }

        // Remark: is this code still used? can we remove? handled by openChatWindow
        // called from elsewhere?
        if (config.type === 'pond') {
            console.log('BuddyList open config.type is pond', config);
            // the type of window is a chat window
            // we *don't* need to re-render the buddylist-profile 
            this.openChatWindow(config);
        }

        if (config.type === 'chat' || config.type === 'buddy') {
            // the type of window is a chat window
            // we *don't* need to re-render the buddylist-profile 
            this.openChatWindow(config);
        }

    }

    createHTMLContent(htmlStr) {
        const html = document.createElement('div');
        html.innerHTML = htmlStr;
        $('.loginForm input[name="username"]').focus();
        return html;
    }

    getLatestMessages() {
        // This can also be called when closing a chat window to let the server
        // know we are no longer interested in messages from that buddy or pond
        const data = {
            buddyname: this.subscribedBuddies.join(','),
            pondname: this.subscribedPonds.join(','),
            me: this.bp.me
        };
        this.bp.apps.client.sendMessage({ id: uuid(), method: 'getMessages', data: data });
    }

    buddyReadNewMessages(data) {
        this.bp.log("BuddyReadNewMessages", data);
        const buddyName = data.name;
    }

    async handleChatMessages(data) {
        // console.log('handleChatMessages', data);
        let windowsToUpdate = new Set();
        for (const message of data.result.messages) {
            try {
                // check to see if we have newMessages in local profile for message.from
                // if so, send buddypond.receiveInstantMessage(message.from)
                if (message.from && this.data.profileState && this.data.profileState.buddylist && this.data.profileState.buddylist[message.from] && this.data.profileState.buddylist[message.from].newMessages) {
                    // console.log("SENDING READ NEWMESSAGES ALERT");
                    this.data.profileState.buddylist[message.from].newMessages = false;
                    this.client.receivedInstantMessage(message.from, function (err, re) {
                        console.log('receivedInstantMessage', err, re);
                    });
                }
                // console.log('handleChatMessages message', message);
                // return the chatWindow which the message was rendered in
                let chatWindow = await this.renderChatMessage(message);
                windowsToUpdate.add(chatWindow);

            } catch (err) {
                console.log('error rendering chat message', message, err)
            }
        }
        for (const chatWindow of windowsToUpdate) {
            if (chatWindow && chatWindow.content) {
                this.scrollToBottom(chatWindow.content);
            }
        }
        // show help card if local storage does not have the card shown
        if (this.bp.settings['viewed-help-card'] !== true && !this.bp.isMobile()) {
            console.log('windowsToUpdate', windowsToUpdate)
            let chatWindow = windowsToUpdate.values().next().value;
            if (chatWindow.type === 'pond') {
                this.showCard({
                    chatWindow,
                    cardName: 'help'
                });
                // console.log('showing help card', chatWindow);
                this.showedHelp = true;
            }
        }

    }

    sendMessageToServer(data, emitLocal = false) {
        this.bp.log('buddy::sendMessage', data);
        data.uuid = uuid();

        if (data.text === '') {
            console.log('will not sendMessageToServer: no text');
            return;
        }

        // so confusing client.sendMessage....maybe should be sendWorkerMessage...dunno
        if (data.type === 'pond') {
            console.log('sendMessageToServer', data);
            buddypond.pondSendMessage(data.to, data.text, data, function (err, result) {
                console.log('pondSendMessage', err, result)
                console.log(err, result)
            })

        }
        if (data.type === 'buddy') {
            console.log('sendMessageToServer', data);
            buddypond.sendMessage(data.to, data.text, data, function (err, result) {
                console.log('pondSendMessage', err, result)
                console.log(err, result)
            });
        }
       
    }

    // called on open to verify token ( if exists )
    // signup / login logic is in buddylistUIEvents.js
    handleAuthentication() {
        const api = this.bp.apps.client.api;
        const localToken = localStorage.getItem('qtokenid');
        const me = localStorage.getItem('me');
        if (!localToken) return;
        // console.log('localToken', localToken, me);
        api.verifyToken(me, localToken, (err, data) => {
            if (err) {
                console.error('Failed to verify token:', err);
                $('.password').show();
                $('.loginForm .error').text('Failed to authenticate buddy');
                return;
            }
            console.log('verified token', data);
            if (data.success) {
                // A pre-existing token was found and verified, emit the auth event
                this.bp.emit('auth::qtoken', { qtokenid: localToken, me: me, hasPassword: data.user.hasPassword });
                $('.loggedIn').flexShow();
                $('.loggedOut').flexHide();
                if (!data.user.hasPassword) {
                    this.bp.open('pincode');
                }
                if (window.discordView) {
                    // minimize window
                    this.buddyListWindow.minimize();
                }

            } else {
                $('.loginForm .error').text('Failed to authenticate buddy');
                $('.password').show();
                console.error('Failed to authenticate buddy:');
            }
        });

    }

    // TODO: this event should only set the qtokenid and local settings?
    // it could open the chat window?
    // maybe also could connect to the websocket server for buddylist?
    // opening the default window initializes the messages client
    async handleAuthSuccess(qtoken) {
        // console.log('handleAuthSuccess', qtoken);
        if (this.client) {
            // console.error('buddylist websocket client already exists and has not been closed. This should not happen');
            return;
        }

        this.bp.me = qtoken.me;
        this.bp.qtokenid = qtoken.qtokenid;
        this.data.profileState = this.data.profileState || {};
        this.data.profileState.me = this.bp.me;

        $('#me_title').html('Welcome ' + this.bp.me);

        // TODO: connect-to-websocket-server should happen here
        // plays welcome message
        this.bp.play('desktop/assets/audio/WELCOME.mp3', { tryHard: Infinity });


        // this will eventually trigger the buddylist::connected event
        this.client = new this.Client(bp);
        let connected = await this.client.connect();

        if (!qtoken.hasPassword) {
            // if the user does not have a password, open the pincode window
            this.bp.open('pincode');
        }

        // check if window.tempDiscordId has been set
        // if so, this indicates user is attempting to link their Discord account
        // and we first not logged in when clicking the link
        // if this is the case, re-run window.linkDiscordAccount(window.tempDiscordId);
        if (window.tempDiscordId) {
            console.log('linking Discord account', window.tempDiscordId);
            // link the Discord account
            window.linkDiscordAccount(window.tempDiscordId);
            // clear the tempDiscordId
            window.tempDiscordId = null;
        }

        // wait until buddylist is connected and then opens default chat window if defined
        if (this.defaultPond && this.openDefaultPond !== false) {
            setTimeout(() => {
                // console.log('Opening default pond chat window', this.defaultPond);
                let chatWindow = this.openChatWindow({ pondname: this.defaultPond });
                // loads the hotpond client that populates room lists
                bp.load('pond');
            }, 100);
        }

    }
}

BuddyList.prototype.renderOrUpdateBuddyInBuddyList = renderOrUpdateBuddyInBuddyList;
BuddyList.prototype.createChatMessageElement = createChatMessageElement;
BuddyList.prototype.renderChatMessage = renderChatMessage;
BuddyList.prototype.renderBuddyRequests = renderBuddyRequests;
BuddyList.prototype.processBuddylist = processBuddylist;
BuddyList.prototype.buddylistUIEvents = buddylistUIEvents;
BuddyList.prototype.openChatWindow = openChatWindow;
BuddyList.prototype.generateDefaultProfile = generateDefaultProfile;
BuddyList.prototype.requestDefaultCoinAllocations = requestDefaultCoinAllocations;
BuddyList.prototype.sortBuddyList = sortBuddyList;
BuddyList.prototype.showContextMenu = showContextMenu;

BuddyList.prototype.createMessageContextMenu = createMessageContextMenu;
BuddyList.prototype.bindMessageContextMenu = bindMessageContextMenu;
BuddyList.prototype.loadUserApps = loadUserApps;
BuddyList.prototype.sendMessageHandler = sendMessageHandler;
BuddyList.prototype.showCard = showCard;
BuddyList.prototype.scrollToBottom = scrollToBottom;

BuddyList.prototype.defaultAvatarSvg = defaultAvatarSvg;
BuddyList.prototype.registerEventHandlers = registerEventHandlers;
BuddyList.prototype.createBuddyListWindow = createBuddyListWindow;
BuddyList.prototype.logout = logout;

// new API
BuddyList.prototype.Client = Client;