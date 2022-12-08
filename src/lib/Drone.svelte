<script>
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  const dispatch = createEventDispatcher();

  export let player = { x: -100, y: -100, size: 0 };
  export let size = 160;
  export let topSpeed = 5;
  export let minSpeed = 1;
  export let id;
  let deathSize = 0;
  let growthFactor = 0;
  const maxGrowthFactor = 600;
  let maxSize = 160;
  $: growthOffset = growthFactor / 2;
  let growthInterval;
  let growthDelay = 250;

  $: xMax = -size + (() => window.innerWidth)();
  $: yMax = -size + (() => window.innerHeight)();
  let alive = true;
  let x = ~~(Math.random() * window.innerWidth - size);
  let y = ~~(Math.random() * window.innerHeight - size);
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
    deathSize = 0;
    growthFactor = 0;
  }

  export function resize() {
    const xPrevMax = xMax;
    const yPrevMax = yMax;
    xMax = window.innerWidth - size;
    yMax = window.innerHeight - size;
    const xConversion = xPrevMax / xMax;
    const yConversion = yPrevMax / yMax;
    x = ~~(x * xConversion);
    y = ~~(y * yConversion);
    if (x > xMax) x = xMax;
    if (y > yMax) y = yMax;
  }

  export function move() {
    if (!alive) return;
    // if (!alive) {
    //   if (growthFactor < maxGrowthFactor) growthFactor += .1;
    //   return;
    // }
    x += xStep;
    y += yStep;
    if (x > xMax || x < 0) {
      xStep = -xStep;
      x = x < 0 ? 0 : xMax;
      x += xStep;
    }
    if (y > yMax || y < 0) {
      yStep = -yStep;
      y = y < 0 ? 0 : yMax;
      y += yStep;
    }
    const { x: playerX, y: playerY, size: playerSize } = player;
    if (playerSize) {
      if (x + size < playerX + playerSize * .2) return;
      if (y + size < playerY + playerSize * .2) return;
      if (x > playerX + playerSize * .8) return;
      if (y > playerY + playerSize * .8) return;
      alive = false;
      deathSize = size;
      growthFactor = 1;
      // deadFactor = 4;
      dispatch('kill', { id });
    }
  }

  export function grow() {
    // if (alive && size > 16) {
    //   size--;
    // }
    if (!alive && growthFactor < maxGrowthFactor && growthFactor > 0) growthFactor++;
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

<div class="drone" class:dead={!alive} style="left:{x - growthOffset}px; top:{y - growthOffset}px; height:{deathSize ? deathSize + growthFactor : size}px; width:{deathSize ? deathSize + growthFactor : size}px; border-radius:{deathSize ? (deathSize + growthFactor) / 2 : size / 2}px"></div>

<style>
  .drone {
    position:absolute;
    background:#ccc;
    z-index: 1;
  }
  .dead {
    z-index: 0;
    background:#333;
  }
</style>
