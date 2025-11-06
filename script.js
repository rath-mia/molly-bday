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
    
    // MySpace Music Player
    setupMusicPlayer();
  });

  // Music Player Functionality
  function setupMusicPlayer() {
    const audio = document.getElementById('myspaceAudio');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const volumeBtn = document.getElementById('volumeBtn');
    const volumeSlider = document.getElementById('volumeSlider');
    
    if (!audio) return;
    
    // Set initial volume
    audio.volume = volumeSlider.value / 100;
    
    // Play/Pause button
    playPauseBtn.addEventListener('click', () => {
      if (audio.paused) {
        audio.play().catch(e => {
          console.log('Autoplay prevented, user interaction required');
          playPauseBtn.textContent = '▶ PLAY';
        });
        playPauseBtn.textContent = '⏸ PAUSE';
      } else {
        audio.pause();
        playPauseBtn.textContent = '▶ PLAY';
      }
    });
    
    // Volume button
    let isMuted = false;
    volumeBtn.addEventListener('click', () => {
      if (isMuted) {
        audio.volume = volumeSlider.value / 100;
        volumeBtn.textContent = '🔊 VOLUME';
        isMuted = false;
      } else {
        audio.volume = 0;
        volumeBtn.textContent = '🔇 MUTED';
        isMuted = true;
      }
    });
    
    // Volume slider
    volumeSlider.addEventListener('input', (e) => {
      audio.volume = e.target.value / 100;
      if (audio.volume === 0) {
        volumeBtn.textContent = '🔇 MUTED';
        isMuted = true;
      } else {
        volumeBtn.textContent = '🔊 VOLUME';
        isMuted = false;
      }
    });
    
    // Try to autoplay (may be blocked by browser)
    audio.play().catch(() => {
      playPauseBtn.textContent = '▶ PLAY';
      // Play on first user interaction
      document.addEventListener('click', () => {
        audio.play().then(() => {
          playPauseBtn.textContent = '⏸ PAUSE';
        }).catch(() => {});
      }, { once: true });
    });
    
    // Update button text based on audio state
    audio.addEventListener('play', () => {
      playPauseBtn.textContent = '⏸ PAUSE';
    });
    
    audio.addEventListener('pause', () => {
      playPauseBtn.textContent = '▶ PLAY';
    });
  }
  