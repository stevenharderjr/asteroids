export default function timer(callback, defaultDelay) {
  let interval;
  return function grow(delay) {
    clearInterval(interval);
    interval = setInterval(callback, delay || defaultDelay);
    return () => clearInterval(interval);
  };
}
