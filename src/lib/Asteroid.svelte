<script>
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import { vector, reflect, force, distance, magnitude } from '../utils/vector.js'
  const dispatch = createEventDispatcher();

  export let player = { x: -100, y: -100, size: 0 };
  export let size = 160;
  export let mass = 20;
  export let topSpeed = 5;
  export let minSpeed = 1;
  export let id;
  let boostLimit = 1.5;
  let maxSize = 160;
  let growthInterval;
  let growthDelay = 250;

  $: xMax = (() => window.innerWidth)();
  $: yMax = (() => window.innerHeight)();
  $: minCoord = -size;
  let alive = true;
  let x = ~~(Math.random() * window.innerWidth - size);
  let y = ~~(Math.random() * window.innerHeight - size);
  let accel = .2;

  let h = +(-topSpeed + Math.random() * (topSpeed * 2)).toFixed(2);
  if (h > -minSpeed && h < minSpeed) {
    h = h < 0 ? -minSpeed : minSpeed;
  }

  let v = +(-topSpeed + Math.random() * (topSpeed * 2)).toFixed(2);
  if (v > -minSpeed && v < minSpeed) {
    v = v < 0 ? -minSpeed : minSpeed;
  }

  export function init() {
    clearInterval(growthInterval);
    alive = true;
    x = ~~(Math.random() * window.innerWidth - size);
    y = ~~(Math.random() * window.innerHeight - size);
  }

  export function resize() {
    const { innerWidth, innerHeight } = window;
    const xRatio = innerWidth / xMax;
    const yRatio = innerHeight / yMax;
    x *= xRatio;
    y *= yRatio;
    xMax = innerWidth;
    yMax = innerHeight;
  }

  export function move() {
    if (!alive) return;

    x += h;
    y += v;
    if (x > xMax) x = minCoord;
    else if (x < minCoord) x = xMax;
    if (y > yMax) y = minCoord;
    else if (y < minCoord) y = yMax;

    const { x: playerX, y: playerY, size: playerSize, heading: playerHeading, mass: playerMass } = player;
    if (playerSize) {
      // const hitboxTL = playerSize * 0.3;
      // const hitboxBR = playerSize * 0.7;
      // if (x + size < playerX + hitboxTL) return;
      // if (y + size < playerY + hitboxTL) return;
      // if (x > playerX + hitboxBR) return;
      // if (y > playerY + hitboxBR) return;
      // must be in contact

      // direction of bouncer to player
      const heading = { h, v };
      const asteroidOffset = size / 2;
      const playerOffset = playerSize / 2;
      if (distance([playerX + playerOffset, playerY + playerOffset], [x + asteroidOffset, y + asteroidOffset]) > (asteroidOffset + playerOffset * 0.5)) return;

      const currentSpeed = magnitude(heading);
      const playerSpeed = magnitude(playerHeading);
      const playerForce = playerSpeed * playerMass;
      const asteroidForce = currentSpeed * mass;
      const relativePlayerForce = playerForce / asteroidForce;
      const relativeAsteroidForce = asteroidForce / playerForce;
      console.log({ playerForce, asteroidForce });


      const positionVector = vector({ h: playerX + playerOffset, v: playerY + playerOffset}, { h: x + asteroidOffset, v: y + asteroidOffset });
      // median of player and bouncer trajectories?
      const medianVector = vector(playerHeading, heading);
      // vector from median trajectory and relative position
      const combined = vector(medianVector, positionVector);
      dispatch('collision', force(reflect(combined), 0.01));

      // reflection of trajectory/position vector
      const newVector = force(combined, 0.02);
      // const bounceVector = vector(positionVector, bouncerVector);
      h = newVector.h;
      v = newVector.v;
      x += h;
      y += v;

      if (h < 0) {
        const min = -minSpeed;
        const max = -topSpeed * boostLimit;
        if (h > min) h = min;
        if (h < max) h = max;
      } else {
        const max = topSpeed * boostLimit;
        if (h < minSpeed) h = minSpeed;
        if (h > max) h = max;
      }

      if (v < 0) {
        const min = -minSpeed;
        const max = -topSpeed * boostLimit;
        if (v > min) v = min;
        if (v < max) v = max;
      } else {
        const max = topSpeed * boostLimit;
        if (v < minSpeed) v = minSpeed;
        if (v > max) v = max;
      }
    }
    // alive = false;
    // deathSize = size;
    // growthFactor = 1;
    // deadFactor = 4;
    // dispatch('kill', { id });
  }

  export function grow() {
    // if (alive && size > 16) {
    //   size--;
    // }
  }

  // export function respondToInput() {
  //   if (!alive) return;
  //   if (keys.ArrowUp) {
  //     if (yStep > 0) {
  //       yStep *= (1 - accel);
  //       if (yStep < minSpeed) yStep = -minSpeed;
  //     } else if (yStep > -topSpeed) yStep *= (1 + accel);
  //   }
  //   if (keys.ArrowDown) {
  //     if (yStep < 0) {
  //       yStep *= (1 - accel);
  //       if (yStep > -minSpeed) yStep = minSpeed;
  //     } else if (yStep < topSpeed) yStep *= (1 + accel);
  //   }
  //   if(keys.ArrowRight) {
  //     if (xStep < 0) {
  //       xStep *= (1 - accel);
  //       if (xStep > -minSpeed) xStep = minSpeed;
  //     } else if (xStep < topSpeed) xStep *= (1 + accel);
  //   }
  //   if(keys.ArrowLeft) {
  //     if (xStep > 0) {
  //       xStep *= (1 - accel);
  //       if (xStep < minSpeed) xStep = -minSpeed;
  //     } else if (xStep > -topSpeed) xStep *= (1 + accel);
  //   }
  // }
</script>

<div class="bouncer" class:dead={!alive} style="left:{x}px; top:{y}px; height:{size}px; width:{size}px; border-radius:{size}px"></div>

<style>
  .bouncer {
    position:absolute;
    background:#333;
    z-index: 1;
  }
  .dead {
    display: none;
  }
</style>
