<template>
  <div id="minigames">
    <h1>Mini Games</h1>
    <ul>
      <li><router-link to="/minigames/airplane-shooting">Airplane Shooting</router-link></li>
      <li><router-link to="/minigames/avoid-obstacles">Avoid Obstacles</router-link></li>
      <li><router-link to="/minigames/brick-breaker">Brick Breaker</router-link></li>
      <li><router-link to="/minigames/gomoku">Gomoku</router-link></li>
      <li><router-link to="/minigames/gomoku-one">Gomoku One</router-link></li>
      <!-- <li><router-link to="/minigames/tetris-game">Tetris Game</router-link></li> -->
    </ul>
  </div>
</template>

<script>
export default {
  name: 'MiniGames',
  beforeRouteLeave (to, from, next) {
    // 현재 활성화된 게임 컴포넌트를 찾아 종료합니다.
    if (this.$route.name.startsWith('minigames/')) {
      const activeGameComponent = this.$children.find(comp => comp.$options.name === this.$route.name);
      if (activeGameComponent && activeGameComponent.cleanup) {
        activeGameComponent.cleanup();
      }
    }
    next();
  }
}
</script>

<style scoped>
#minigames {
  display: flex;
  flex-direction: column;
  align-items: center;
}
#minigames ul {
  list-style-type: none;
  padding: 0;
}
#minigames li {
  margin: 10px 0;
}
</style>
