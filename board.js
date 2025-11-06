// Board functionality for birthday messages

// Get messages from localStorage
function getMessages() {
  const messages = localStorage.getItem('mollyBirthdayMessages');
  return messages ? JSON.parse(messages) : [];
}

// Save messages to localStorage
function saveMessages(messages) {
  localStorage.setItem('mollyBirthdayMessages', JSON.stringify(messages));
}

// Display all messages on the board
function displayMessages() {
  const messages = getMessages();
  const board = document.getElementById('messagesBoard');
  
  if (messages.length === 0) {
    board.innerHTML = '<p class="no-messages">No messages yet. Be the first to wish Molly a happy birthday!</p>';
    return;
  }

  // Sort by newest first
  const sortedMessages = messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  board.innerHTML = sortedMessages.map((msg, index) => `
    <div class="message-card">
      <div class="message-header">
        <h3 class="message-name">${escapeHtml(msg.name)}</h3>
        <span class="message-date">${formatDate(msg.timestamp)}</span>
      </div>
      <p class="message-text">${escapeHtml(msg.message).replace(/\n/g, '<br>')}</p>
      ${msg.image ? `<div class="message-image"><img src="${msg.image}" alt="Image from ${escapeHtml(msg.name)}"></div>` : ''}
    </div>
  `).join('');
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Format date nicely
function formatDate(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Convert image to base64
function imageToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Handle form submission
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('messageForm');
  const imageInput = document.getElementById('image');
  const imagePreview = document.getElementById('imagePreview');
  const previewImg = document.getElementById('previewImg');
  const removeImageBtn = document.getElementById('removeImage');
  let imageData = null;

  // Display messages on load
  displayMessages();

  // Handle image preview
  imageInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        imageInput.value = '';
        return;
      }
      
      imageData = await imageToBase64(file);
      previewImg.src = imageData;
      imagePreview.style.display = 'block';
    }
  });

  // Remove image
  removeImageBtn.addEventListener('click', () => {
    imageInput.value = '';
    imagePreview.style.display = 'none';
    imageData = null;
  });

  // Handle form submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const message = document.getElementById('message').value.trim();

    if (!name || !message) {
      alert('Please fill in both name and message fields.');
      return;
    }

    const newMessage = {
      id: Date.now().toString(),
      name: name,
      message: message,
      image: imageData,
      timestamp: new Date().toISOString()
    };

    const messages = getMessages();
    messages.push(newMessage);
    saveMessages(messages);

    // Reset form
    form.reset();
    imagePreview.style.display = 'none';
    imageData = null;

    // Refresh display
    displayMessages();

    // Show success message
    const submitButton = form.querySelector('.submit-button');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Posted! ✓';
    submitButton.style.background = '#06d6a0';
    setTimeout(() => {
      submitButton.textContent = originalText;
      submitButton.style.background = '';
    }, 2000);
  });
});

