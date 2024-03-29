export function vector({ h: x1, v: y1 }, { h: x2, v: y2 }) {
  return { h: x1 - x2, v: y1 - y2 };
}

export function accelerate({ h: x1, v: y1 }, { h: x2, v: y2 }) {
  return { h: x1 + x2, v: y1 + y2 };
}

export function force({ h, v }, factor = 1.2) {
  return {
    h: h !== 0 ? h * factor : h,
    v: v !== 0 ? v * factor : v,
  };
}

export function reflect({ h, v }, axis) {
  return {
    h: !axis || axis === 'x' || axis > 0 ? -h : h,
    v: !axis || axis === 'y' || axis < 0 ? -v : v,
  };
}

export function magnitude({ h, v }) {
  return Math.sqrt(h * h + v * v);
}

export function distance([x1, y1], [x2, y2]) {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}
