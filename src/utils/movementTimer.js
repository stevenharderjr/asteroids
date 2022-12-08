export function movementTimer(callback) {
  let interval;
  return function move() {
    clearInterval(interval, (delay = 16));
    interval = setInterval(callback, delay);
    return () => clearInterval(interval);
  };
}
