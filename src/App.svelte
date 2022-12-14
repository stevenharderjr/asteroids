<script>
  import { fade, crossfade } from 'svelte/transition';
  import { onMount, onDestroy } from 'svelte'
  import { messageTimer } from './utils/messageTimer.js';
  import {humanTime} from './utils/humanTime.js';
  import timer from './utils/timer.js';
  import Player from './lib/Player.svelte';
  import Bullet from './lib/Bullet.svelte';
  // import Drone from './lib/Drone.svelte';
  // import Projectile from './lib/Projectile.svelte';

  const move = timer(() => updateBouncers('move'), 16);
  const grow = timer(() => updateBouncers('grow'), 200);

  let message = '';
  let clearMessage = () => {};
  const say = messageTimer(text => message = text);

  let start;
  let maxEnemies = 40;
  let maxProjectiles = 20;
  let enemies = maxEnemies;
  $: playerSize = Math.max((enemies - maxProjectiles) * 4, 16); //120;
  let drones = [];
    for (let i = 0; i < enemies; i++) drones.push(i);
  let bullets = [];
    for (let i = 0; i < maxProjectiles; i++) bullets.push(i);
  let bulletIndex = 0;
  let bouncers = [];
  let playerStatus = { x: -100, y: -100, size: 0, h: 0, v: 0 };
  let playing = true;
  let movementDelay = 16;
  let growthDelay = 15000;
  let stopMoving = () => {};
  let stopGrowing = () => {};
  let keys = {};
  $: player = bouncers[0];

  function fireNextBullet() {
    console.log('Should fire a bullet');
    if (bulletIndex === maxProjectiles) bulletIndex = 0;
    const { x, y, h, v } = playerStatus;
    bullets[bulletIndex].fire(x, y, { h, v });
  }

  function handleResize() {
    updateBouncers('resize');
  }

  function handleRestart() {
    clearMessage();

    enemies = maxEnemies;
    updateBouncers('init');
    start = Date.now();
  }

  function handleInputCommunication() {
    player.respondToInput(keys);
  }

  function confirmKill({ detail: { id: droneId }}) {
    enemies--;
    player.killConfirmed();
    if (enemies - maxProjectiles === 0) return endStage();
  }

  function handleBounce({ detail }) {
    player.bounce(detail);
  }

  function updateBouncers(method, factor) {
    const length = bouncers.length;
    for (let i = 0; i < length; i++) {
      const bouncerMethod = bouncers[i][method];
      if (bouncerMethod) {
        let statusUpdate = bouncerMethod(factor);
        if (statusUpdate) playerStatus = statusUpdate;
      }
    }
  }

  function handlePause() {
    if (playing) {
      if (enemies < 1) return handleRestart();
      stopMoving();
      stopGrowing();
      clearMessage();
      playing = false;
      clearMessage = say(["COLLIDE WITH DRONES TO DESTROY THEM", "USE ARROW KEYS TO CHANGE SPEED & DIRECTION", "FINISH IN LESS THAN A MINUTE TO SEE YOUR TIME", "PRESS [ENTER] TO RESUME PLAYING"], -1);
    } else {
      clearMessage();
      playing = true;
      clearMessage = say("GAME ON!")
      stopMoving = move();
      stopGrowing = grow();
    }
    return;
  }

  function endStage() {
    clearMessage = say([(`DRONES DESTROYED IN ${humanTime(Date.now() - start)}`).toUpperCase(), "PRESS [ENTER] TO CONTINUE"], -1);
  }

  onMount(() => {
    start = Date.now();
    stopGrowing = grow();
    stopMoving = move();
    clearMessage = say('PRESS [ENTER] FOR GAMEPLAY INSTRUCTIONS');
    window.addEventListener('resize', handleResize);
  });
  onDestroy(() => {
    stopGrowing();
    stopMoving();
    clearMessage();
    window.removeEventListener('resize', handleResize);
  });
</script>

<main>
  <div class="container">
    <Player bind:size={playerSize} bind:this={bouncers[0]} on:enter-key={handlePause} on:shoot={fireNextBullet} />
    {#each bullets as bullet, i}
      <Bullet id={i} bind:this={bullets[i]} />
    {/each}
  </div>
  <div class="overlay">
  {#if message}
    <div class="opacity">
      {#if playing}
        <h2 class="message">{message}</h2>
      {:else}
        <h2 class="message">PAUSED</h2>
        <span class="message">{message}</span>
      {/if}
    </div>
  {/if}
  </div>
</main>

<style>
  .container {
    overflow: hidden;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    height: 100%;
    width: 100%;
    z-index: 0;
  }
  .message {
    z-index: 4;
    display:flex;
  }
  .overlay {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    /* backdrop-filter: blur(8px); */
  }
  .opacity {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: #0006;
    backdrop-filter: blur(8px);
    border-radius: 16px;
    padding: 32px 64px;
    transition: all;
  }
  /* .ball {
    position: absolute;
    height: 16px;
    width: 16px;
    background: white;
  } */
</style>
