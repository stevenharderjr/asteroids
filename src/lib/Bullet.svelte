<script>
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import { vector, reflect, force, magnitude } from '../utils/vector.js'
  const dispatch = createEventDispatcher();

  export let id;
  let x;
  let y;
  let heading = { h: 0, v: 0 };
  let size = 8;

  let xMin = -size;
  let yMin = -size;
  let xMax = window.innerWidth;
  let yMax = window.innerHeight;
  let distanceTraveled;
  let topSpeed = 30;
  let range = 120;
  let spent = true;
  $: opacity = 1 - (1 / (range - distanceTraveled));

  function init() {
    spent = true;
    distanceTraveled = 0;
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

  export function fire(playerStatus) {
    if (!spent) return;
    const { x: playerX, y: playerY, size: playerSize, rotation: playerRotation, heading: playerHeading } = playerStatus;
    spent = false;
    distanceTraveled = 0;

    const rads = (playerRotation - 90) * 0.0174533;
    const { h: playerH, v: playerV } = playerHeading;
    x = (playerX - 6 + playerSize / 2) - playerH;
    y = (playerY - 6 + playerSize / 2) - playerV;
    const playerSpeed = magnitude(playerHeading);
    // const factor = topSpeed / playerSpeed;
    heading = force({ h: Math.cos(rads), v: Math.sin(rads)}, playerSpeed + 10 );
  }

  export function move() {
    if (spent) return;
    if (++distanceTraveled > range) {
      distanceTraveled = range;
      spent = true;
      return;
    }
    const { h, v, } = heading;
    x += h;
    y += v;
    if (x > xMax) x = xMin;
    if (x < xMin) x = xMax;
    if (y > yMax) y = yMin;
    if (y < yMin) y = yMax;
  }
</script>

<div class="bullet" class:dead={false} style="left:{x}px; top:{y}px; opacity:{opacity};"></div>

<style>
  .bullet {
    position:absolute;
    background:#fff;
    border-radius: 4px;
    height: 8px;
    width: 8px;
    z-index: 1;
  }
  .dead {
    display: hidden;
  }
</style>
