// Super extra confetti explosion
function confettiExplosion() {
    const colors = ['#ff6b81', '#ffb703', '#8ecae6', '#b15eff', '#06d6a0', '#ff3b5c'];
    const numConfetti = 220;
  
    for (let i = 0; i < numConfetti; i++) {
      const el = document.createElement('div');
      el.className = 'confetti';
      el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      el.style.left = Math.random() * 100 + 'vw';
      el.style.top  = Math.random() * 20 + 'vh'; // start in top 20% for a blast feel
      el.style.transform = `rotate(${Math.random() * 360}deg)`;
      el.style.animationDelay = (Math.random() * 0.35).toFixed(2) + 's';
  
      // varied sizes
      const w = 6 + Math.random() * 10;
      const h = 10 + Math.random() * 16;
      el.style.width = w + 'px';
      el.style.height = h + 'px';
  
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 6000);
    }
  }
  
  window.addEventListener('load', () => {
    confettiExplosion();
    // Uncomment to re-explode every 7 seconds:
    // setInterval(confettiExplosion, 7000);
    
    // Set up play button immediately
    const playBtn = document.getElementById('musicPlayBtn');
    if (playBtn) {
      playBtn.addEventListener('click', togglePlay);
    }
    
    // Try to start music on first user interaction
    setupMusicAutoplay();
  });

  let youtubeIframe = null;
  let isPlaying = false;

  function sendCommand(command) {
    if (!youtubeIframe) {
      youtubeIframe = document.getElementById('youtubePlayer');
      if (!youtubeIframe) {
        console.error('YouTube iframe not found');
        return;
      }
    }
    
    try {
      const message = JSON.stringify({
        event: 'command',
        func: command,
        args: ''
      });
      youtubeIframe.contentWindow.postMessage(message, 'https://www.youtube.com');
      console.log('Sent command:', command);
    } catch (e) {
      console.error('Error sending command:', e);
    }
  }

  function togglePlay() {
    if (!youtubeIframe) {
      youtubeIframe = document.getElementById('youtubePlayer');
      if (!youtubeIframe) {
        alert('Player not found. Please refresh the page.');
        return;
      }
    }
    
    try {
      if (isPlaying) {
        sendCommand('pauseVideo');
        isPlaying = false;
        const playBtn = document.getElementById('musicPlayBtn');
        if (playBtn) {
          playBtn.textContent = '▶ PLAY MUSIC';
          playBtn.classList.remove('playing');
        }
        console.log('Paused video');
      } else {
        sendCommand('playVideo');
        isPlaying = true;
        const playBtn = document.getElementById('musicPlayBtn');
        if (playBtn) {
          playBtn.textContent = '⏸ MUSIC PLAYING';
          playBtn.classList.add('playing');
        }
        console.log('Playing video');
      }
    } catch (e) {
      console.error('Error toggling play:', e);
      alert('Error: ' + e.message);
    }
  }

  function setupMusicAutoplay() {
    youtubeIframe = document.getElementById('youtubePlayer');
    
    // Listen for messages from YouTube iframe to track state
    window.addEventListener('message', (event) => {
      if (event.origin !== 'https://www.youtube.com') return;
      
      try {
        const data = JSON.parse(event.data);
        if (data.event === 'onStateChange') {
          const playBtn = document.getElementById('musicPlayBtn');
          if (data.info === 1) { // Playing
            isPlaying = true;
            if (playBtn) {
              playBtn.textContent = '⏸ MUSIC PLAYING';
              playBtn.classList.add('playing');
            }
          } else if (data.info === 2 || data.info === 0) { // Paused or Ended
            isPlaying = false;
            if (playBtn) {
              playBtn.textContent = '▶ PLAY MUSIC';
              playBtn.classList.remove('playing');
            }
          }
        }
      } catch (e) {
        // Not a JSON message, ignore
      }
    });
    
    console.log('Music player setup complete');
  }
  