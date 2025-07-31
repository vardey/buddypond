// alert.js - Custom HTML-based alert modal for Discord Activities

// Function to create and show a custom alert modal
export default function showAlert(message, options = {}) {
  // Default options
  const defaults = {
    title: 'Alert',
    buttonText: 'OK',
    onClose: null, // Optional callback when modal is closed
  };
  const config = { ...defaults, ...options };

  if (!window.discordView) {
    return alert(message); // Fallback to native alert if not in Discord Activities
  }

  // Create modal container
  const modal = document.createElement('div');
  modal.className = 'custom-alert-modal';
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100%';
  modal.style.height = '100%';
  modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
  modal.style.zIndex = '1000';

  // Create modal content
  const modalContent = document.createElement('div');
  modalContent.style.backgroundColor = '#fff';
  modalContent.style.padding = '20px';
  modalContent.style.borderRadius = '8px';
  modalContent.style.maxWidth = '50vw';
  modalContent.style.width = '90%';
  modalContent.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
  modalContent.style.fontFamily = 'Arial, sans-serif';
  // align text to center
  modalContent.style.textAlign = 'center';

  // Add title
  const title = document.createElement('h2');
  title.textContent = config.title;
  title.style.margin = '0 0 10px';
  title.style.fontSize = '2.5em';
  title.style.color = '#5865F2'; // Discord-like purple
  modalContent.appendChild(title);

  // Add message
  const messageText = document.createElement('p');
  messageText.textContent = message;
  messageText.style.margin = '0 0 20px';
  messageText.style.fontSize = '2em';
  $(messageText).html(message);
  modalContent.appendChild(messageText);

  // Add OK button
  const button = document.createElement('button');
  button.textContent = config.buttonText;
  button.style.padding = '8px 16px';
  button.style.backgroundColor = '#5865F2'; // Discord-like purple
  button.style.color = '#fff';
  button.style.border = 'none';
  button.style.borderRadius = '4px';
  button.style.cursor = 'pointer';
  button.style.fontSize = '1em';
  button.addEventListener('click', () => {
    modal.remove(); // Remove modal from DOM
    if (config.onClose && typeof config.onClose === 'function') {
      config.onClose(); // Call optional callback
    }
  });
  modalContent.appendChild(button);

  // Append modal content to modal
  modal.appendChild(modalContent);

  // Append modal to document body
  document.body.appendChild(modal);

  // Focus the button for accessibility
  button.focus();

  // Allow closing with Enter or Escape keys
  const handleKeydown = (event) => {
    if (event.key === 'Enter' || event.key === 'Escape') {
      modal.remove();
      if (config.onClose) config.onClose();
      document.removeEventListener('keydown', handleKeydown);
    }
  };
  document.addEventListener('keydown', handleKeydown);
}