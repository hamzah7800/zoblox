let joystick = document.getElementById('joystick');
let startX, startY, dx = 0, dy = 0;
joystick.addEventListener('touchstart', e => {
  const t = e.touches[0];
  startX = t.clientX;
  startY = t.clientY;
});
joystick.addEventListener('touchmove', e => {
  const t = e.touches[0];
  dx = t.clientX - startX;
  dy = t.clientY - startY;
});
joystick.addEventListener('touchend', () => { dx = dy = 0; });
window.getJoystick = () => ({ dx, dy });