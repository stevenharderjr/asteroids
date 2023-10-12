<script>
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import { vector, reflect, force, magnitude } from '../utils/vector.js'
  const dispatch = createEventDispatcher();

  export let id;
  export let targets = [];
  let x;
  let y;
  let heading = { h: 0, v: 0 };
  let speed = 0;
  let size = 8;
  let exploding = false;
  let maxExplosionRadius = 100;

  let xMin = -size;
  let yMin = -size;
  let xMax = window.innerWidth;
  let yMax = window.innerHeight;
  let xRatio = innerWidth / xMax;
  let yRatio = innerHeight / yMax;
  let distanceTraveled;
  let topSpeed = 30;
  let range = Math.min(innerWidth, innerHeight) - 120;
  let spent = true;
  $: opacity = exploding ? 1 - (1 / (maxExplosionRadius / size)) : 1 - (1 / (range - distanceTraveled));
  $: halfSize = size / 2;

  function init() {
    spent = true;
    exploding = false;
    size = 8;
    distanceTraveled = 0;
  }

  export function resize() {
    const { innerWidth, innerHeight } = window;
    xRatio = innerWidth / xMax;
    yRatio = innerHeight / yMax;
    x *= xRatio;
    y *= yRatio;
    xMax = innerWidth;
    yMax = innerHeight;
    range = Math.min(innerWidth, innerHeight) - 120;
  }

  export function fire(playerStatus) {
    if (!spent) return;
    const { x: playerX, y: playerY, size: playerSize, rotation: playerRotation, heading: playerHeading } = playerStatus;
    spent = false;
    distanceTraveled = 0;

    const rads = (playerRotation - 90) * 0.0174533;
    const cos = Math.cos(rads);
    const sin = Math.sin(rads);
    const offsetX = cos * -40;
    const offsetY = sin * -40;
    const { h: playerH, v: playerV } = playerHeading;
    x = (playerX - 6 + playerSize / 2) - offsetX;
    y = (playerY - 6 + playerSize / 2) - offsetY;
    const playerSpeed = magnitude(playerHeading);
    // const factor = topSpeed / playerSpeed;
    heading = force({ h: cos, v: sin }, playerSpeed + 10 );
    speed = magnitude(heading);
  }

  export function move() {
    if (spent) return;
    if (exploding) {
      if (size < maxExplosionRadius) {
        size++;
        return;
      }
      return init();
    }

    if ((++distanceTraveled * speed) > range) {
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

    if (targets?.length) {
      let i = targets.length;
      while (i--) {
        const target = targets[i];
        if (target.overlap({ x, y })) {
          exploding = true;
          opacity = 1;
          x += halfSize;
          y += halfSize;
        }
      }
    }
  }
</script>

{#if !exploding}
  <div class=bullet class:spent={spent} style="left:{x}px; top:{y}px; height:8px; width:8px; opacity:{opacity};"></div>
{:else}
  <div class="explosion" class:spent={spent} style="left:{x - halfSize}px; top:{y - halfSize}px; height:{size}px; width:{size}px; border-radius:{size}px; opacity:{opacity}"></div>
{/if}

<style>
  .bullet {
    position:absolute;
    background:#fff;
    border-radius: 4px;
    height: 8px;
    width: 8px;
    z-index: 2;
  }
  .explosion {
    position: absolute;
    background: #0000;
    border: 2px solid #fff;
    height: 12px;
    width: 12px;
    z-index: 2;
  }
  .spent {
    display: none;
  }
</style>
