# dev-play
develop branch
==
# vue-router 화면이동시 에러 발생 (상세화면 이동시)
router.push('path') 화면 이동시 에러발생
this.$router.push('path') 뒤에 <b>.catch(() => {});</b>를 붙혀서 에러 해결
