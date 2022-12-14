export function vector({ h: x1, v: y1 }, { h: x2, v: y2 }) {
  return { h: x1 - x2, v: y1 - y2 };
}

export function accelerate({ h: x1, v: y1 }, { h: x2, v: y2 }) {
  return { h: x1 + x2, v: y1 + y2 };
}

export function force({ h, v }, factor = 1.2) {
  return { h: h * factor, v: v * factor };
}

export function reflect({ x, y }, axis) {
  return {
    h: !axis || axis === 'x' || axis > 0 ? -h : h,
    v: !axis || axis === 'y' || axis < 0 ? -v : v,
  };
}

export function magnitude({ h, v }) {
  return Math.sqrt(h * h + v * v);
}
