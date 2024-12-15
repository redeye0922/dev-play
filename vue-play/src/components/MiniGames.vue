<template>
  <div id="minigames">
    <h1>Mini Games</h1>
    <ul>
      <li><router-link to="/minigames/brick-breaker">Brick Breaker</router-link></li>
      <li><router-link to="/minigames/tetris">Tetris</router-link></li>
      <li><router-link to="/minigames/gomoku">Gomoku</router-link></li>
      <li><router-link to="/minigames/avoid-obstacles">Avoid Obstacles</router-link></li>
      <li><router-link to="/minigames/airplane-shooting">Airplane Shooting</router-link></li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'MiniGames'
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
