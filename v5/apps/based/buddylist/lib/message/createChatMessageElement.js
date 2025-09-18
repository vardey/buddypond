import renderGeoFlag from './renderGeoFlag.js';
import parseMarkdownWithoutPTags from './parseMarkdownWithoutPTags.js';

// Configuration
const config = {
  useMarkdown: true,
  allowHTML: true,
};

// New function to create hover menu
// TODO: remove buttons, just use icons
// TODO: update bindMessageContextMenu() method to bind to the icons instead of buttons
function createHoverMenu(message) {
  const hoverMenu = document.createElement('div');
  hoverMenu.className =
    'aim-hover-menu';

  const menuItems = [];

  menuItems.push({ text: 'React', action: 'react-message', svg: 'desktop/assets/images/icons/svg/1f600.svg' });


  if (message.from === this.bp.me || this.bp.me === 'Marak') { // TODO: admin rbac
    menuItems.push({ text: 'Edit Message', action: 'edit-message', icon: 'fa-duotone fa-regular fa-pencil' });
  }

  menuItems.push({ text: 'Reply Message', action: 'reply-message', icon: 'fa-duotone fa-regular fa-reply' });
  menuItems.push({ text: '...', action: 'more-options', icon: 'fa-solid fa-regular fa-ellipsis' });


  menuItems.forEach(item => {
    const button = document.createElement('button');
    button.setAttribute('data-action', item.action);
    button.className = 'aim-hover-menu-item';

    if (item.icon) {
      const icon = document.createElement('i');
      icon.className = item.icon;
      button.appendChild(icon);
      button.appendChild(document.createTextNode(' ')); // Add space between icon and text
    } else if (item.svg) {
      // create svg element
      const svg = document.createElement('img');
      svg.src = item.svg;
      svg.alt = item.text;
      svg.className = 'aim-hover-menu-svg-icon';
      button.appendChild(svg);
      // button.appendChild(document.createTextNode(' ')); // Add space between icon and text

    } else {
      button.appendChild(document.createTextNode(item.text));
    }
    // set title hint with item.text  
    button.setAttribute('title', item.text);
    hoverMenu.appendChild(button);
  });

  return hoverMenu;
}

export default function createChatMessageElement(message, messageTime, chatWindow, cardContainer) {
  // Create main message container
  const chatMessage = document.createElement('div');
  chatMessage.className = 'aim-chat-message';
  chatMessage.setAttribute('data-id', message.id);
  chatMessage.setAttribute('data-from', message.from);
  chatMessage.setAttribute('data-to', message.to);
  chatMessage.setAttribute('data-type', message.type);
  chatMessage.setAttribute('data-uuid', message.uuid);
  chatMessage.setAttribute('data-chat-id', message.chatId);

  // Profile picture (SVG)
  const profilePicture = document.createElement('div');
  profilePicture.className = 'aim-profile-picture';

  if (!message.profilePicture) {
    // check if we happen to have a profilePicture in local cache
    // this may happen if Randolph or other admin is sending messages on behalf of a user
    // TODO: better way to do this...
    if (
      this.bp.apps.buddylist.data.profileState &&
      this.bp.apps.buddylist.data.profileState.buddylist &&
      this.bp.apps.buddylist.data.profileState.buddylist[message.from] &&
      this.bp.apps.buddylist.data.profileState.buddylist[message.from].profile_picture) {
      message.profilePicture = this.bp.apps.buddylist.data.profileState.buddylist[message.from].profile_picture;
    }

  }

  if (message.profilePicture) {
    // use url as profile picture src
    const img = document.createElement('img');
    if (window.discordMode) {
      message.profilePicture = message.profilePicture.replace('https://files.buddypond.com', bp.config.cdn);
    }
    img.src = message.profilePicture;
    img.alt = `${message.from}'s avatar`;
    img.className = 'aim-chat-message-profile-picture-img';
    profilePicture.appendChild(img);
  } else {
    const defaultAvatar = this.defaultAvatarSvg(message.from);
    profilePicture.innerHTML = defaultAvatar;
  }

  // console.log('profilePicture', profilePicture);
  profilePicture.alt = `${message.from}'s avatar`;

  // Message content wrapper
  const contentWrapper = document.createElement('div');
  contentWrapper.className = 'aim-content-wrapper';

  // Message header (sender + timestamp)
  const messageHeader = document.createElement('div');
  messageHeader.className = 'aim-message-header';

  const sender = document.createElement('span');
  sender.className = 'aim-sender';
  sender.textContent = message.from === 'anonymous'
    ? `Anonymous (${message.tripcode || 'tr1pc0d3'})`
    : message.from;

  const timestamp = document.createElement('span');
  timestamp.className = 'aim-timestamp';
  timestamp.textContent = messageTime;

  // Message meta (geoflag + badges placeholder)
  const messageMeta = document.createElement('div');
  messageMeta.className = 'aim-message-meta';

  const geoFlag = renderGeoFlag(message);
  const badgesContainer = document.createElement('span');
  badgesContainer.className = 'aim-badges';

  messageMeta.appendChild(geoFlag);
  messageMeta.appendChild(badgesContainer);

  messageHeader.appendChild(sender);
  messageHeader.appendChild(messageMeta);
  messageHeader.appendChild(timestamp);

  // Reply indicator (if message is a reply)
  let replyIndicator = null;
  if (message.replyto) {
    const repliedMessage = chatWindow.content.querySelector(
      `.aim-chat-message[data-uuid="${message.replyto}"]`
    );
    if (repliedMessage) {
      const repliedSender = repliedMessage.querySelector('.aim-sender')?.textContent || 'Unknown';
      const repliedText = repliedMessage.querySelector('.aim-message-content')?.innerText || '';

      replyIndicator = document.createElement('div');
      replyIndicator.className = 'aim-reply-indicator';
      replyIndicator.innerHTML = `
        <span class="aim-reply-sender">${repliedSender}</span>
        <span class="aim-reply-content">${repliedText}</span>
      `;

      // Add click handler to scroll to the replied message
      const replySender = replyIndicator.querySelector('.aim-reply-sender');
      replySender.addEventListener('click', () => {
        repliedMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        repliedMessage.classList.add('aim-highlight');
        setTimeout(() => repliedMessage.classList.remove('aim-highlight'), 2000);
      });
    }
  }

  // Message content
  const messageContent = document.createElement('div');
  messageContent.className = 'aim-message-content';

  const processedText = config.useMarkdown
    ? parseMarkdownWithoutPTags(message.text)
    : message.text;

  if (config.allowHTML) {
    messageContent.innerHTML = processedText;
  } else {
    messageContent.textContent = processedText;
  }

  // Message reactions
  const reactionsContainer = document.createElement('div');
  reactionsContainer.className = 'aim-message-reactions';

  if (message.reactions) {
    // console.log('message.reactions', message.reactions);
    message.reactions = JSON.parse(message.reactions);
    for (let reaction in message.reactions) {
      // console.log('reaction', reaction, 'count', message.reactions[reaction]);
      const count = message.reactions[reaction].count;
      // console.log('Rendering reaction:', reaction, count);
      const reactionElement = document.createElement('span');
      reactionElement.className = 'aim-message-reaction';
      reactionElement.setAttribute('data-emoji', reaction);
      reactionElement.innerHTML = `
        <span class="aim-reaction-emoji">${reaction}</span>
        <span class="aim-reaction-count">${count}</span>
      `;
      // add title property to reactionElement with .buddies who reacted
      const buddies = message.reactions[reaction].buddies || [];
      if (buddies.length > 0) {
        reactionElement.setAttribute('title', `Reacted by: ${buddies.join(', ')}`);
      }
      reactionsContainer.appendChild(reactionElement);
    }

  }

  // Hover menu
  const hoverMenu = createHoverMenu.call(this, message)

  // Assemble message
  contentWrapper.appendChild(messageHeader);
  if (replyIndicator) {
    contentWrapper.appendChild(replyIndicator);
  }
  contentWrapper.appendChild(messageContent);
  contentWrapper.appendChild(hoverMenu);

  if (cardContainer) {
    contentWrapper.appendChild(cardContainer);
  }

  contentWrapper.appendChild(reactionsContainer);


  chatMessage.appendChild(profilePicture);
  chatMessage.appendChild(contentWrapper);

  // Image load handler
  chatMessage.querySelectorAll('img').forEach(img => {
    img.addEventListener('load', () => {
      // Implement scrollToBottom when ready
    });
  });

  insertChatMessage(chatWindow, message, chatMessage);
  return chatMessage;
}

// Remark: Origina unoptimized version, left here for reference
// TODO: remove this after new code path has been verified in production for some time
/*
function insertChatMessageLegacy(chatWindow, message, chatMessage) {
  // console.log('insertChatMessage', chatWindow, message, chatMessage);
  let aimMessages = chatWindow.content.querySelector('.aim-messages');

  if (message.type === 'pond') {
    // console.log('Inserting message into pond chat window', message);
    aimMessages = chatWindow.content.querySelector(`.aim-messages-container[data-context="${message.to}"] .aim-messages`);
    // console.log('Pond messages container found:', aimMessages);
  }

  if (!aimMessages) {
    // TODO: this case should never be hit? investigate why it is being hit sometimes
    console.log('aim-messages not found. chat window is not yet ready...');
    return;
  }

  const allMessages = Array.from(aimMessages.querySelectorAll('.aim-chat-message'));
  let inserted = false;

  for (const existingMessage of allMessages) {
    const existingId = parseInt(existingMessage.getAttribute('data-id'), 10);
    if (message.id < existingId) {
      // Remark: insertBefore is taking up a lot of CPU time when loading large chat histories
      aimMessages.insertBefore(chatMessage, existingMessage);
      inserted = true;
      break;
    }
  }

  if (!inserted) {
    aimMessages.appendChild(chatMessage);
  }

  return chatMessage;
}
*/

// Remark: new optimized version using binary search, may be able to optimize further
function insertChatMessage(chatWindow, message, chatMessage) {
  let aimMessages = chatWindow.content.querySelector('.aim-messages');

  if (message.type === 'pond') {
    aimMessages = chatWindow.content.querySelector(
      `.aim-messages-container[data-context="${message.to}"] .aim-messages`
    );
  }

  if (!aimMessages) {
    console.log('aim-messages not found. chat window is not yet ready...');
    return;
  }

  const children = aimMessages.children;
  const count = children.length;

  // ✅ Fast path: append if empty or greater than last message ID
  if (
    count === 0 ||
    message.id > parseInt(children[count - 1].getAttribute('data-id'), 10)
  ) {
    aimMessages.appendChild(chatMessage);
    return chatMessage;
  }

  // ✅ Binary search for insertion point
  let low = 0;
  let high = count - 1;
  let insertBeforeNode = null;

  while (low <= high) {
    const mid = (low + high) >> 1;
    const midId = parseInt(children[mid].getAttribute('data-id'), 10);

    if (isNaN(midId)) {
      console.warn(`Invalid data-id on message node:`, children[mid]);
      low = mid + 1;
      continue;
    }

    if (message.id < midId) {
      insertBeforeNode = children[mid];
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }

  if (insertBeforeNode) {
    aimMessages.insertBefore(chatMessage, insertBeforeNode);
  } else {
    // fallback, though fast path usually covers this
    aimMessages.appendChild(chatMessage);
  }

  return chatMessage;
}