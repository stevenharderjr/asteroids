<script>
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import { vector, reflect, force } from '../utils/vector.js'
  const dispatch = createEventDispatcher();

  export let x;
  export let y;
  export let heading;
  export let player = { x: -100, y: -100, size: 0 };
  export let size = 8;
  export let id;

  let xMin = -size;
  let yMin = -size;
  let xMax = window.innerWidth;
  let yMax = window.innerHeight;
  let distanceTraveled = 0;
  let range = xMax / 2;
  let alive = true;

  export function resize() {
    xMax = window.innerWidth;
    yMax = window.innerHeight;
  }

  export function move() {
    if (!alive || distanceTraveled > range) return;

    distanceTraveled++;
    const { x: vX, y: vY } = heading;
    x += vX;
    y += vY;
    if (x > xMax) x = xMin;
    if (x < xMin) x = xMax;
    if (y > yMax) y = yMin;
    if (y < yMin) y = yMax;
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
