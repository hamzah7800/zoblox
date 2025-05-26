window.Joystick = function(containerId) {
  const base = document.querySelector('#joystick-base');
  const stick = document.querySelector('#joystick-stick');

  let dragging = false, startX = 0, startY = 0, dx = 0, dy = 0;

  base.addEventListener('touchstart', e => {
    dragging = true;
    const touch = e.targetTouches[0];
    startX = touch.clientX;
    startY = touch.clientY;
  });

  base.addEventListener('touchmove', e => {
    if (!dragging) return;
    e.preventDefault();
    const touch = e.targetTouches[0];
    dx = touch.clientX - startX;
    dy = touch.clientY - startY;
    const dist = Math.min(Math.sqrt(dx*dx + dy*dy), 40);
    const angle = Math.atan2(dy, dx);
    stick.style.left = `${40 + dist * Math.cos(angle)}px`;
    stick.style.top = `${40 + dist * Math.sin(angle)}px`;
  });

  base.addEventListener('touchend', () => {
    dragging = false;
    dx = dy = 0;
    stick.style.left = '25px';
    stick.style.top = '25px';
  });

  return {
    getDirection: () => ({ x: dx / 40, y: dy / 40 })
  };
}