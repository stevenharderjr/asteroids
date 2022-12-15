export function cycle(min = 0, max = 0, step = 1) {
  let count = min;
  let end = max - 1;

  return () => {
    if (count > end) count = min;
    return count++;
  };
}
