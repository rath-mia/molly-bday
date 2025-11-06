// Board functionality for birthday messages using Firebase Firestore

// Get messages from Firestore
function getMessages() {
  return db.collection('messages')
    .orderBy('timestamp', 'desc')
    .get()
    .then((querySnapshot) => {
      const messages = [];
      querySnapshot.forEach((doc) => {
        messages.push({ id: doc.id, ...doc.data() });
      });
      return messages;
    })
    .catch((error) => {
      console.error('Error getting messages:', error);
      return [];
    });
}

// Listen for real-time updates
function setupRealtimeListener() {
  db.collection('messages')
    .orderBy('timestamp', 'desc')
    .onSnapshot((querySnapshot) => {
      const messages = [];
      querySnapshot.forEach((doc) => {
        messages.push({ id: doc.id, ...doc.data() });
      });
      displayMessages(messages);
    }, (error) => {
      console.error('Error listening to messages:', error);
      // Fallback to regular display
      getMessages().then(displayMessages);
    });
}

// Save message to Firestore
function saveMessage(messageData) {
  return db.collection('messages').add({
    name: messageData.name,
    message: messageData.message,
    image: messageData.image || null,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  })
  .then((docRef) => {
    console.log('Message saved with ID:', docRef.id);
    return docRef.id;
  })
  .catch((error) => {
    console.error('Error saving message:', error);
    throw error;
  });
}

// Delete message from Firestore
function deleteMessage(messageId) {
  return db.collection('messages').doc(messageId).delete()
    .then(() => {
      console.log('Message deleted:', messageId);
    })
    .catch((error) => {
      console.error('Error deleting message:', error);
      throw error;
    });
}

// Display all messages on the board
function displayMessages(messages) {
  const board = document.getElementById('messagesBoard');
  
  if (!messages || messages.length === 0) {
    board.innerHTML = '<p class="no-messages">No messages yet. Be the first to wish Molly a happy birthday!</p>';
    return;
  }

  // Sort by newest first (Firestore already orders by timestamp desc)
  board.innerHTML = messages.map((msg) => `
    <div class="message-card">
      <div class="message-header">
        <h3 class="message-name">${escapeHtml(msg.name)}</h3>
        <button class="delete-btn" data-message-id="${msg.id}" style="display: none; background: #ff3b5c; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; font-size: 11px;">× Delete</button>
      </div>
      <p class="message-text">${escapeHtml(msg.message).replace(/\n/g, '<br>')}</p>
      ${msg.image ? `<div class="message-image"><img src="${msg.image}" alt="Image from ${escapeHtml(msg.name)}"></div>` : ''}
    </div>
  `).join('');
  
  // Add click handlers for delete buttons
  board.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation(); // Prevent card click from triggering
      
      if (!isAdminLoggedIn) {
        alert('Please log in as admin to delete messages.');
        return;
      }
      
      const messageId = e.target.getAttribute('data-message-id');
      
      if (confirm('Are you sure you want to delete this message?')) {
        try {
          await deleteMessage(messageId);
          // Message will disappear automatically via real-time listener
        } catch (error) {
          alert('Error deleting message. Make sure Firebase security rules allow deletes.');
          console.error(error);
        }
      }
    });
    
    // Show delete button if admin is logged in
    if (isAdminLoggedIn) {
      btn.style.display = 'block';
    }
  });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Format date nicely
function formatDate(date) {
  if (!date) return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Compress and convert image to base64
function imageToBase64(file) {
  return new Promise((resolve, reject) => {
    const originalSize = file.size;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        // Smaller max dimensions for larger files
        let maxWidth = 800;
        let maxHeight = 800;
        if (originalSize > 5 * 1024 * 1024) {
          maxWidth = 600;
          maxHeight = 600;
        } else if (originalSize > 2 * 1024 * 1024) {
          maxWidth = 700;
          maxHeight = 700;
        }
        
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to base64 with compression - adjust quality based on original size
        let quality = 0.7;
        if (originalSize > 5 * 1024 * 1024) {
          quality = 0.4;
        } else if (originalSize > 2 * 1024 * 1024) {
          quality = 0.5;
        }
        
        // Helper function to compress and check size
        const compressAndCheck = (qualityLevel) => {
          canvas.toBlob((blob) => {
            const reader2 = new FileReader();
            reader2.onload = () => {
              const result = reader2.result;
              // If still too large, compress more aggressively
              if (result.length > 900000 && qualityLevel > 0.3) {
                compressAndCheck(qualityLevel - 0.1);
              } else {
                resolve(result);
              }
            };
            reader2.onerror = reject;
            reader2.readAsDataURL(blob);
          }, 'image/jpeg', qualityLevel);
        };
        
        compressAndCheck(quality);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Admin state
let isAdminLoggedIn = false;
const ADMIN_USERNAME = 'mia';
const ADMIN_PASSWORD = 'mia';

// Handle admin login
function handleAdminLogin() {
  const username = prompt('Username:');
  const password = prompt('Password:');
  
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    isAdminLoggedIn = true;
    localStorage.setItem('mollyAdminLoggedIn', 'true');
    updateAdminUI();
    alert('✓ Admin mode enabled! Delete buttons are now visible.');
  } else if (username !== null || password !== null) {
    alert('Incorrect username or password');
  }
}

// Handle admin logout
function handleAdminLogout() {
  isAdminLoggedIn = false;
  localStorage.removeItem('mollyAdminLoggedIn');
  updateAdminUI();
  // Hide all delete buttons
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.style.display = 'none';
  });
  alert('Admin mode disabled');
}

// Update admin UI
function updateAdminUI() {
  const loginBtn = document.getElementById('adminLoginBtn');
  const statusSpan = document.getElementById('adminStatus');
  
  if (isAdminLoggedIn) {
    loginBtn.textContent = '🚪 Logout';
    loginBtn.onclick = handleAdminLogout;
    if (statusSpan) statusSpan.style.display = 'inline';
  } else {
    loginBtn.textContent = '🔐 Admin Login';
    loginBtn.onclick = handleAdminLogin;
    if (statusSpan) statusSpan.style.display = 'none';
  }
}

// Handle form submission
document.addEventListener('DOMContentLoaded', () => {
  // Check if Firebase is initialized
  if (typeof db === 'undefined') {
    document.getElementById('messagesBoard').innerHTML = 
      '<p class="no-messages" style="color: red;">⚠️ Firebase not configured. Please set up Firebase to enable message sharing.</p>';
    return;
  }

  // Check if admin was previously logged in
  if (localStorage.getItem('mollyAdminLoggedIn') === 'true') {
    isAdminLoggedIn = true;
  }

  // Set up admin login button
  const adminLoginBtn = document.getElementById('adminLoginBtn');
  if (adminLoginBtn) {
    updateAdminUI();
  }

  const form = document.getElementById('messageForm');
  const imageInput = document.getElementById('image');
  const imagePreview = document.getElementById('imagePreview');
  const previewImg = document.getElementById('previewImg');
  const removeImageBtn = document.getElementById('removeImage');
  let imageData = null;

  // Set up real-time listener for messages
  setupRealtimeListener();
  
  // Show delete buttons when hovering on message cards (only if admin)
  const board = document.getElementById('messagesBoard');
  if (board) {
    board.addEventListener('mouseenter', (e) => {
      if (!isAdminLoggedIn) return;
      const card = e.target.closest('.message-card');
      if (card) {
        const deleteBtn = card.querySelector('.delete-btn');
        if (deleteBtn) {
          deleteBtn.style.display = 'block';
        }
      }
    }, true);
    
    board.addEventListener('mouseleave', (e) => {
      if (!isAdminLoggedIn) return;
      const card = e.target.closest('.message-card');
      if (card) {
        const deleteBtn = card.querySelector('.delete-btn');
        if (deleteBtn && !card.matches(':hover')) {
          deleteBtn.style.display = 'none';
        }
      }
    }, true);
  }

  // Handle image preview
  imageInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 10MB - will be compressed to fit Firestore)
      if (file.size > 10 * 1024 * 1024) {
        alert('Image size must be less than 10MB. It will be compressed automatically.');
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

    const submitButton = form.querySelector('.submit-button');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Posting...';
    submitButton.disabled = true;

    try {
      // Check if image is too large (Firestore has 1MB limit per field)
      let finalImageData = imageData;
      if (imageData && imageData.length > 900000) { // ~900KB base64 = ~675KB original
        alert('Image is too large even after compression. Please use a smaller image.');
        submitButton.textContent = originalText;
        submitButton.disabled = false;
        return;
      }

      const newMessage = {
        name: name,
        message: message,
        image: finalImageData || null
      };

      await saveMessage(newMessage);

      // Reset form
      form.reset();
      imagePreview.style.display = 'none';
      imageData = null;

      // Show success message
      submitButton.textContent = 'Posted! ✓';
      submitButton.style.background = '#06d6a0';
      setTimeout(() => {
        submitButton.textContent = originalText;
        submitButton.style.background = '';
        submitButton.disabled = false;
      }, 2000);
    } catch (error) {
      console.error('Error posting message:', error);
      alert('Error posting message. Please try again.');
      submitButton.textContent = originalText;
      submitButton.disabled = false;
    }
  });
});
