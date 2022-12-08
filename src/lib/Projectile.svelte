<script>
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import { vector, reflect, force } from '../utils/vector.js'
  const dispatch = createEventDispatcher();

  export let player = { x: -100, y: -100, size: 0 };
  export let size = 160;
  export let topSpeed = 5;
  export let minSpeed = 1;
  export let id;
  let boostLimit = 2;
  let maxSize = 160;
  let growthInterval;
  let growthDelay = 250;

  let xMin = -size;
  let yMin = -size;
  let xMax = window.innerWidth;
  let yMax = window.innerHeight;
  let alive = true;
  let x = ~~(Math.random() * xMax - size);
  let y = ~~(Math.random() * yMax - size);
  x *= Math.round(Math.random()) ? xMax : -xMax;
  y *= Math.round(Math.random()) ? yMax : -yMax;
  let accel = .2;

  let xStep = +(-topSpeed + Math.random() * (topSpeed * 2)).toFixed(2);
  if (xStep > -minSpeed && xStep < minSpeed) {
    xStep = xStep < 0 ? -minSpeed : minSpeed;
  }

  let yStep = +(-topSpeed + Math.random() * (topSpeed * 2)).toFixed(2);
  if (yStep > -minSpeed && yStep < minSpeed) {
    yStep = yStep < 0 ? -minSpeed : minSpeed;
  }

  export function init() {
    clearInterval(growthInterval);
    alive = true;
    x = ~~(Math.random() * window.innerWidth - size);
    y = ~~(Math.random() * window.innerHeight - size);
    x *= Math.round(Math.random()) ? xMax : -xMax;
    y *= Math.round(Math.random()) ? yMax : -yMax;
  }

  export function resize() {
    const xPrevMax = xMax;
    const yPrevMax = yMax;
    xMax = window.innerWidth;
    yMax = window.innerHeight;
    const xConversion = xPrevMax / xMax;
    const yConversion = yPrevMax / yMax;
    x = ~~(x * xConversion);
    y = ~~(y * yConversion);
    if (x > xMax) x = xMax;
    if (y > yMax) y = yMax;
  }

  export function move() {
    if (!alive) return;

    x += xStep;
    y += yStep;
    if (x > xMax) x = xMin;
    if (x < xMin) x = xMax;
    if (y > yMax) y = yMin;
    if (y < yMin) y = yMax;

    const { x: playerX, y: playerY, size: playerSize, xStep: playerXStep, yStep: playerYStep } = player;
    if (playerSize) {
      if (x + size < playerX + playerSize * .2) return;
      if (y + size < playerY + playerSize * .2) return;
      if (x > playerX + playerSize * .8) return;
      if (y > playerY + playerSize * .8) return;
      const bouncer = { x, y };
      // direction of bouncer to player
      const positionVector = vector({ x: playerX + playerSize / 2, y: playerY + playerSize / 2 }, { x: x + size / 2, y: y + size / 2 });
      // player trajectory
      const playerVector = vector(player, { x: playerXStep, y: playerYStep });
      // bouncer trajectory
      const bouncerVector = vector(bouncer, { x: xStep, y: yStep });
      // median of player and bouncer trajectories?
      const newVector = vector(playerVector, bouncerVector);
      // median of median trajectory and position direction
      const combinedVector = vector(newVector, positionVector);
      // reflection of trajectory/position vector
      dispatch('bounce', combinedVector);
      const bounceVector = force(reflect(combinedVector), .8);
      // const bounceVector = vector(positionVector, bouncerVector);
      const { x: vX, y: vY } = bounceVector;
      x += vX;
      y += vY;
      xStep += vX;
      yStep += vY;

      let max = topSpeed * boostLimit;
      let min = minSpeed;
      if (xStep > 0) xStep = (xStep < min) ? min : (xStep > max) ? max : xStep;
      if (yStep > 0) yStep = (yStep < min) ? min : (yStep > max) ? max : yStep;
      max = -max;
      min = -min;
      if (xStep < 0) xStep = (xStep > min) ? min : (xStep < max) ? max : xStep;
      if (yStep < 0) yStep = (yStep > min) ? min : (yStep < max) ? max : yStep;
    }
  }
</script>

<div class="bouncer" class:dead={!alive} style="left:{x}px; top:{y}px; height:{size}px; width:{size}px; border-radius:{size / 2}px"></div>

<style>
  .bouncer {
    position:absolute;
    background:#000;
    z-index: 1;
  }
  .dead {
    display: hidden;
  }
</style>
