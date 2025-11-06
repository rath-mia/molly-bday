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
  });
  