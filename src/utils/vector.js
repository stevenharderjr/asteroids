export function vector({ x: x1, y: y1 }, { x: x2, y: y2 }) {
  return { x: x1 - x2, y: y1 - y2 };
}

export function accelerate({ x: x1, y: y1 }, { x: x2, y: y2 }) {
  return { x: x1 + x2, y: y1 + y2 };
}

export function force({ x, y }, factor = 1.2) {
  return { x: x * factor, y: y * factor };
}

export function reflect({ x, y }, axis) {
  return {
    x: !axis || axis === 'x' || axis > 0 ? -x : x,
    y: !axis || axis === 'y' || axis < 0 ? -y : y,
  };
}
