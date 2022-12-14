<script>
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import { vector, reflect, force } from '../utils/vector.js'
  const dispatch = createEventDispatcher();

  export let id;
  let x;
  let y;
  let h;
  let v;
  let size = 4;

  let xMin = -size;
  let yMin = -size;
  let xMax = window.innerWidth;
  let yMax = window.innerHeight;
  let distanceTraveled = 0;
  let range = xMax / 2;
  let alive = false;

  export function resize() {
    const { innerWidth, innerHeight } = window;
    const xRatio = innerWidth / xMax;
    const yRatio = innerHeight / yMax;
    x *= xRatio;
    y *= yRatio;
    xMax = innerWidth;
    yMax = innerHeight;
  }

  export function fire(playerX, playerY, playerH, playerV) {
    if (alive) return;
    alive = true;
    x = playerX;
    y = playerY;
    h = playerH;
    v = playerV;
  }

  export function move() {
    if (!alive) return;
    if (distanceTraveled > range) {
      alive = false;
      dispatch('max-range', id);
    }

    distanceTraveled++;
    x += h;
    y += v;
    if (x > xMax) x = xMin;
    if (x < xMin) x = xMax;
    if (y > yMax) y = yMin;
    if (y < yMin) y = yMax;
  }
</script>

<div class="bullet" class:dead={!alive} style="left:{x}px; top:{y}px;"></div>

<style>
  .bullet {
    position:absolute;
    background:#fff;
    border-radius: 2px;
    height: 4px;
    width: 4px;
    z-index: 1;
  }
  .dead {
    display: hidden;
  }
</style>
