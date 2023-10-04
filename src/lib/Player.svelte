<script>
  // import logo from '../assets/logo192.png';
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import { vector, force, reflect, accelerate, magnitude } from '../utils/vector.js'
  // import logo from '../assets/RALOS1.svg';
  export let topSpeed = 8;
  export let minSpeed = 0;
  export let status = 'player';

  const dispatch = createEventDispatcher();

  let keys = {};
  export let size = 32;
  let heading = { h: 0, v: 0 };
  let alive = true;
  let minSize = 16;
  $: radius = size / 2;
  let maxSize = 400;
  let xMin = -size;
  let yMin = -size;
  let xMax = window.innerWidth;
  let yMax = window.innerHeight;
  let x = ~~(window.innerWidth / 2 - size / 2);
  let y = ~~(window.innerHeight / 2 - size / 2);
  let speed = 0;
  let accel = 0.25;
  let engineBoostFactor = 1;
  let turningBoostFactor = 1;
  let decel = .996;
  let entropy = true;
  let decelInterval;
  let bounceEffect = .8;
  let priorSteeringInput = 0;
  let rotationSpeed = 0;
  let rotationAccel = 1.5;
  let rotationDecel = 1.01;
  let maxRotationSpeed = 8;
  let rotation = 0;
  let flashDuration = 400;
  let flashingTimeout;

  export function resize() {
    const { innerWidth, innerHeight } = window;
    topSpeed = Math.min(innerWidth, innerHeight) / 120;
    const xRatio = innerWidth / xMax;
    const yRatio = innerHeight / yMax;
    x *= xRatio;
    y *= yRatio;
    xMax = innerWidth;
    yMax = innerHeight;
    return { x, y, size, heading };
  }

  export function move() {
    if (!alive) return;
    const { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Space } = keys;
    if (!(ArrowUp || ArrowDown)) {
      heading = force(heading, decel);
    } else {
      rotationSpeed /= rotationDecel;
      if (Space) rotationSpeed /= rotationDecel;
      const rads = (rotation - 90) * 0.0174533;
      const direction = accel * (ArrowUp ? 1 : -0.25);
      const newHeading = accelerate(heading, { h: Math.cos(rads) * direction * engineBoostFactor, v: Math.sin(rads) * direction * engineBoostFactor});
      const speed = magnitude(newHeading);
      if (Math.abs(speed) < topSpeed * engineBoostFactor) {
        heading = newHeading;
      } else {
        const factor = topSpeed * engineBoostFactor / speed;
        heading = force(newHeading, factor);
      }
    }
    const { h, v } = heading;
    x += h;
    y += v;
    if (x > xMax) x = xMin;
    if (x < xMin) x = xMax;
    if (y > yMax) y = yMin;
    if (y < yMin) y = yMax;
    rotation += rotationSpeed;
    rotationSpeed /= rotationDecel;
    return { x, y, size, rotation, heading };
  }

  function handleKeyDown({ key }) {
    if(key === 'Enter') return dispatch('enter-key');

    // if (keys[key]) return;
    keys[key === ' ' ? 'Space' : key] = true;
    // switch(key) {
    //   case 'ArrowUp':
    //     keys.ArrowDown = undefined;
    //     break;
    //   case 'ArrowDown':
    //     keys.ArrowUp = undefined;
    //     break;
    //   case 'ArrowLeft':
    //     // keys.ArrowRight = undefined;
    //     break;
    //   case 'ArrowRight':
    //     // keys.ArrowLeft = undefined;
    //     break;
    //   default:
    //     break;
    // }
    if (key === 'ArrowUp' || key === 'ArrowRight' || key === 'ArrowLeft' || key === ' ' || key === 'ArrowDown') respondToInput();
  }

  function handleKeyUp({ key }) {
    // keys = {};
    keys[key === ' ' ? 'Space' : key] = undefined;
    // if (key === 'ArrowDown' || key === 'ArrowUp' || key === 'ArrowRight' || key === 'ArrowLeft') respondToInput();
  }

  function respondToInput() {
    engineBoostFactor = 1;

    const { ArrowUp, ArrowRight, ArrowLeft, Space } = keys;
    if (Space) dispatch('shoot', { x, y, size, rotation, heading });
    // if (keys.ArrowDown) {
    //   if (yStep < 0) {
    //     yStep *= (1 - accel);
    //     if (yStep > -minSpeed) yStep = minSpeed;
    //   } else if (yStep < topSpeed) yStep *= (1 + accel);
    // }
    if (!(ArrowRight || ArrowLeft)) {
      engineBoostFactor = 1;
    } else if (ArrowRight && ArrowLeft) {
      priorSteeringInput = 0;
      rotationSpeed *= 0.5;
    } else {
      let boostedRotationAccel = rotationAccel;

      if (ArrowRight && (!ArrowLeft || (ArrowLeft && priorSteeringInput > 0))) {
        // priorSteeringInput: quicker initial rotation change when changing direction
        let max = maxRotationSpeed;
        priorSteeringInput = 1;

        if (ArrowLeft) {
          boostedRotationAccel /= 2;
          max /= 2;
          priorSteeringInput = 0;
        } else if (ArrowUp) {
          boostedRotationAccel **= 2;
        }

        if (rotationSpeed > 0) {
          rotationSpeed *= (1 + boostedRotationAccel);
        } else if (rotationSpeed < -.5) {
          rotationSpeed *= (1 - boostedRotationAccel);
        } else {
          rotationSpeed = boostedRotationAccel / 2;
        }

        if (!ArrowLeft && (rotationSpeed > max / 2)) rotationSpeed = max / 2;

        if (rotationSpeed > max) rotationSpeed = max;
      }

      if (ArrowLeft && (!ArrowRight || (ArrowRight && priorSteeringInput < 0))) {
        priorSteeringInput = -1;
        let max = -maxRotationSpeed;
        if (ArrowRight) {
          boostedRotationAccel /= 2;
          max /= 2;
          priorSteeringInput = 0;
        } else if (ArrowUp) {
          boostedRotationAccel **= 2;
        }

        if (rotationSpeed < 0) {
          rotationSpeed *= (1 + boostedRotationAccel)
          } else if (rotationSpeed > .5) {
          rotationSpeed *= (1 - boostedRotationAccel);
        } else {
          rotationSpeed = -boostedRotationAccel / 2;
        }

        if (!ArrowRight && (rotationSpeed < max / 2)) rotationSpeed = max / 2;
        if (rotationSpeed < max) rotationSpeed = max;
      }

      if (ArrowUp) {
        engineBoostFactor = 2;
        priorSteeringInput = 0;
        // boostedRotationAccel **= 2;
      }

    }
  }

  export function killConfirmed() {
    xMax = window.innerWidth - size;
    yMax = window.innerHeight - size;
    clearTimeout(flashingTimeout);
    status = 'flashing';
    flashingTimeout = setTimeout(() => status = 'player', flashDuration);
  }

  onMount(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    resize();
  });
  onDestroy(() => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
  });
</script>

<!-- <div class="player" class:flashing={status === 'flashing'} style="left:{x}px; top:{y}px; width:{size}px; height:{size}px; transform:rotate({rotation}deg);"></div> -->
  <!-- <img class="player" class:flashing={status === 'flashing'} src={logo} style="left:{x}px; top:{y}px; height:{size}px; width:{size}px; transform:rotate({rotation}deg);" alt="player" /> -->


  <svg width="16px" height="16px" viewBox="0 0 16 16" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="player" style="left:{x}px; top:{y}px; width:{size}px; height:{size}px; transform:rotate({rotation}deg);">

    <title>Rocket</title>

    <defs></defs>
    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g transform="translate(1.000000, 0.000000)" fill="#ccc">
            <path d="M10.023,8.441 C10.023,8.441 11.322,10.408 12.601,11.035 C13.593,11.517 12.492,14.427 11.962,15.681 C11.811,16.035 11.605,16.025 11.39,15.723 C10.982,15.15 10.17,13.968 8.888,13.968 L4.134,13.968 C2.851,13.968 2.039,15.15 1.632,15.723 C1.417,16.025 1.209,16.035 1.06,15.681 C0.53,14.426 -0.571,11.517 0.42,11.035 C1.7,10.408 2.999,8.441 2.999,8.441 L10.023,8.441 L10.023,8.441 Z" class="si-glyph-fill"></path>
            <path d="M10.192,9.062 C9.83,5.966 8.6,1.06 7.076,0.077 C6.898,0.056 6.717,0.043 6.537,0.043 C6.353,0.043 6.175,0.056 5.996,0.077 C4.472,1.06 3.241,5.967 2.88,9.062 C2.81,9.666 2.772,10.205 2.772,10.627 C2.772,12.152 3.261,13.272 4.032,13.984 L9.042,13.984 C9.813,13.271 10.302,12.152 10.302,10.627 C10.301,10.204 10.263,9.666 10.192,9.062 L10.192,9.062 Z M6.5,4 C7.3281427,4 8,4.67198632 8,5.50128242 C8,6.32972357 7.3281427,7 6.5,7 C5.67100793,7 5,6.32972357 5,5.50128242 C5,4.67198632 5.67100793,4 6.5,4 L6.5,4 Z" class="si-glyph-fill"></path>
        </g>
    </g>
</svg>


<style>
  .player {
    z-index: 8;
    position:absolute;
  }
  .flashing {
    animation: linear infinite;
    animation-name: blinker;
    animation-duration: 100ms;
  }
  @keyframes blinker {
    50% {
      fill: white;
    }
  }
</style>
