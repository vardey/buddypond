export default function defaultChatWindowButtons(bp) {

    return [
        {
            text: 'Upload File',
            image: 'desktop/assets/images/icons/icon_upload_64.png',
            //icon: '<i title="Upload File" class="button-bar-button-icon button-bar-button fa-duotone fa-regular fa-upload"></i>',
            onclick: async (ev) => {
                let context = ev.target.dataset.context;
                let type = ev.target.dataset.type;

                // Create a hidden file input dynamically
                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.accept = '*/*'; // customize this if needed (e.g., 'image/*' or '.txt,.pdf')
                fileInput.style.display = 'none';

                // Append to DOM to make it usable
                document.body.appendChild(fileInput);

                // Listen for file selection
                fileInput.addEventListener('change', async () => {
                    const file = fileInput.files[0];
                    console.log('Selected file:', file);
                    if (file) {
                        file.filePath = 'uploads/' + file.name; // Add filePath if needed
                        try {
                            // Optionally show a progress UI
                            const onProgress = (percent) => {
                                console.log(`Upload progress: ${percent}%`);
                            };

                            // Call your API method
                            let result = await bp.apps.client.api.uploadFile(file, onProgress);
                            // console.log('Upload successful', result);

                            // send the message with the uploaded file
                            let message = {
                                from: bp.me,
                                to: context,
                                text: result,
                                type: type || 'buddy'
                            }
                            // console.log('Sending message with uploaded file', message);
                            bp.apps.client.api.sendCardMessage(message, function (err, response) {
                                if (err) {
                                    console.error('Error sending message', err);
                                } else {
                                    console.log('Message sent', response);
                                }
                            });
                        } catch (err) {
                            console.error('Upload failed:', err);
                        }
                    }

                    // Clean up
                    fileInput.remove();
                });

                // Trigger the file picker
                fileInput.click();

                return false;
            }
        },
        {
            text: 'Image Search',
            image: 'desktop/assets/images/icons/icon_image-search_64.png',
            onclick: async (ev) => {
                let context = ev.target.dataset.context;
                let type = ev.target.dataset.type;
                // Open the image search window
                bp.open('image-search', {
                    output: type || 'buddy',
                    context: context,
                    provider: 'giphy-stickers'
                });
                return false;
            }
        },

        {
            text: 'BuddySound',
            image: 'desktop/assets/images/icons/icon_soundrecorder_64.png',
            onclick: (ev) => {
                console.log('BuddySound button clicked', ev);
                let context = ev.target.dataset.context;
                let type = ev.target.dataset.type;
                bp.open('soundrecorder', { type: type || 'buddy', output: type || 'buddy', context: context });

            }
        },
        /* TOOD: add gifstudio back ( with better UX and features )
        {
            text: 'BuddyGif',
            image: 'desktop/assets/images/icons/icon_gifstudio_64.png',
            onclick: (ev) => {
                let context = ev.target.dataset.context;
                let type = ev.target.dataset.type;
                JQDX.openWindow('gifstudio', { type: type || 'buddy', context: context, output: type || 'buddy' });
            }
        },
        */
        {
            text: 'BuddyPaint',
            image: 'desktop/assets/images/icons/icon_paint_64.png',
            onclick: (ev) => {
                let context = ev.target.dataset.context;
                let type = ev.target.dataset.type;
                bp.open('paint', { type: type || 'buddy', output: type || 'buddy', context: context });
            }
        },
        {
            text: 'BuddySnap',
            env: 'desktop-only', // for now, use default mobile camera
            image: 'desktop/assets/images/icons/svg/1f4f7.svg',
            onclick: (ev) => {
                let context = ev.target.dataset.context;
                let type = ev.target.dataset.type;
                // desktop.ui.openWindow('mirror', { type: type || 'buddy', context: context, output: type || 'buddy' });
                bp.open('camera', { type: type || 'buddy', output: type || 'buddy', context: context });
            }
        },
        {
            text: 'BuddyEmoji',
            image: 'desktop/assets/images/icons/svg/1f600.svg',
            className: 'emojiPicker',
            onclick: async (ev) => {

                let $target = $(ev.target);

                // ensure that we don't already have an emoji-picker-popup in document
                if ($('.emoji-picker-popup').length > 0) {
                    $('.emoji-picker-popup').remove();
                }

                $target.emojiPicker({
                    onSelect: (emoji) => {
                        console.log("Selected:", emoji);
                        let messageControls = $target.closest('.aim-message-controls');
                        $('.aim-input', messageControls).val((i, val) => val + emoji).trigger('input').focus();
                    }
                });

                // Immediately show the picker (bypasses internal click)
                $target.data('emojiPicker_show')?.();

                // focus on .emoji-search input
                if ($('.emoji-picker-popup').length > 0) {
                    $('.emoji-search').focus();
                }
                return;

                // Replaced: Jun 17, 2025
                // Legacy EmojiPicker code below, can be removed once we confirm new code above works well
                // EmojiPicker lazy load is a special case
                // All other BuddyPond deps / lazy imports with await bp.load() are fine to work as expected
                // We usually don't need to check existence of the app before loading it
                // For EmojiPicker we need to recall the original click event with same parameters
                // This could be resolved by using a new EmojiPicker library or patching the current one
                if (!bp.apps['emoji-picker']) { // this is not a normal practice for user in await bp.load()
                    await bp.load('emoji-picker');
                    // Create a new MouseEvent with the original event's coordinates
                    const newEvent = new MouseEvent('click', {
                        bubbles: true,
                        cancelable: true,
                        clientX: ev.clientX, // Preserve original x coordinate
                        clientY: ev.clientY, // Preserve original y coordinate
                        // Include other relevant properties if needed
                        button: ev.button,
                        target: ev.target
                    });
                    // Dispatch the new event on the original target
                    ev.target.dispatchEvent(newEvent);
                    return;
                }
                // now that the emoji-picker is loaded, we can open it as normal

                // focus on the .emojiPicker input
                $('.emojiPicker').focus();

                // we need to add class activeTextArea to the active textarea
                // so we can append the emoji to the correct textarea
                // remove the activeTextArea from all other textareas
                $('.activeTextArea').removeClass('activeTextArea');

                let messageControls = $(ev.target).closest('.aim-message-controls');
                // find the closest textarea to the ev.target
                $('.aim-input', messageControls).addClass('activeTextArea');

            }
        },
        {
            text: 'BuddyCall',
            type: 'buddy-only',
            image: 'desktop/assets/images/icons/icon_phone_64.png',
            onclick: (ev) => {
                let context = ev.target.dataset.context;
                let type = ev.target.dataset.type;
                // desktop.ui.openWindow('mirror', { type: type || 'buddy', context: context, output: type || 'buddy' });
                bp.open('videochat', { type: type || 'buddy', output: type || 'buddy', context: context, isHost: true });

                // should send message to buddy that will open the videocall window on receiving end
                let message = {
                    from: bp.me,
                    to: context,
                    text: 'Let\'s have a video call',
                    type: 'buddy',
                    card: {
                        type: 'videochat'
                    }
                }


                console.log('BuddyCall message', message);
                // send message to buddy
                buddypond.sendCardMessage(message, function (err, response) {
                    if (err) {
                        console.error('Error sending message', err);
                    } else {
                        console.log('Message sent', response);
                    }
                });


            }
        },
        // spellbook
        {
            text: 'Spellbook',
            image: 'desktop/assets/images/icons/icon_spellbook_64.png',
            onclick: (ev) => {
                ev.preventDefault();
                ev.stopPropagation();

                let context = ev.target.dataset.context;
                let type = ev.target.dataset.type;
                // desktop.ui.openWindow('spellbook', { type: type || 'buddy', context: context, output: type || 'buddy' });
                bp.open('spellbook', { type: type || 'buddy', output: type || 'buddy', context: context });
            }
        },
        // buddycoins
        {
            text: 'BuddyCoins',
            image: 'desktop/assets/images/icons/icon_coin_64.png',
            onclick: (ev) => {
                let context = ev.target.dataset.context;
                let type = ev.target.dataset.type;
                // desktop.ui.openWindow('coin', { type: type || 'buddy', context: context, output: type || 'buddy' });
                bp.open('portfolio', { type: type || 'buddy', output: context, context: '#portfolio-transfer' });
            }
        },
        /* // TODO: add Dictate with improved UX */
        {
            text: 'Dictate',
            env: 'desktop-only',
            image: 'desktop/assets/images/icons/icon_dictate_64.png',
            onclick: async (ev) => {
                let context = ev.target.dataset.context;
                let type = ev.target.dataset.type;
                let targetEl = $('.aim-input', $(ev.target).parent().parent());
                await bp.open('dictate', { type: type || 'buddy', output: type || 'buddy', context: context, targetEl: targetEl });
            }
        },
        {
            text: 'BuddyHelp',
            image: 'desktop/assets/images/icons/icon_help_64.png',
            align: 'right',
            onclick: (ev) => {
                let context = ev.target.dataset.context;
                let type = ev.target.dataset.type;
                // TODO: better way to get the windowId
                // TODO: instead just use context on the button, like how all the other buttons work
                let windowIdPrefix = type === 'pond' ? 'pond_message_-' : 'messages/';
                let windowId = windowIdPrefix + context;
                if (type === 'pond') {
                    windowId = 'pond-chat';
                }
                // console.log('opening chat window ', windowId)
                let chatWindow = bp.apps.ui.windowManager.getWindow(windowId);
                console.log('chatWindow', chatWindow);
                // bp.apps.buddylist.showCard({ chatWindow, cardName: 'help' });

                let aimInput = chatWindow.content.querySelector('.aim-input');
                let sendButton = chatWindow.content.querySelector('.aim-send-btn');
                if (aimInput) {
                    aimInput.value = '/help';
                    aimInput.dispatchEvent(new Event('input', { bubbles: true })); // Trigger input event
                }
                if (sendButton) {
                    sendButton.click(); // Simulate button click
                }




            }
        }
    ]
}