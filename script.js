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
    
    // Try to start music on first user interaction
    setupMusicAutoplay();
  });

  function setupMusicAutoplay() {
    const youtubePlayer = document.getElementById('youtubePlayer');
    const playBtn = document.getElementById('musicPlayBtn');
    if (!youtubePlayer || !playBtn) return;
    
    let isPlaying = false;
    
    // Function to play the music
    const playMusic = () => {
      try {
        // Use YouTube iframe API to play
        youtubePlayer.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
        playBtn.textContent = '⏸ MUSIC PLAYING';
        playBtn.classList.add('playing');
        isPlaying = true;
      } catch (e) {
        console.log('Music play error:', e);
      }
    };
    
    // Function to pause the music
    const pauseMusic = () => {
      try {
        youtubePlayer.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
        playBtn.textContent = '▶ PLAY MUSIC';
        playBtn.classList.remove('playing');
        isPlaying = false;
      } catch (e) {
        console.log('Music pause error:', e);
      }
    };
    
    // Play button click handler
    playBtn.addEventListener('click', () => {
      if (isPlaying) {
        pauseMusic();
      } else {
        playMusic();
      }
    });
    
    // Try to autoplay on page load (may be blocked)
    setTimeout(() => {
      try {
        youtubePlayer.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
        playBtn.textContent = '⏸ MUSIC PLAYING';
        playBtn.classList.add('playing');
        isPlaying = true;
      } catch (e) {
        // Autoplay blocked, button will be ready for user to click
      }
    }, 500);
  }
  