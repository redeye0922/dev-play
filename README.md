# dev-play
vue 환경 세팅 부터 게시판 만들기 까지 
무조건 만들어보기

# vue-router 화면이동시 에러 발생 (상세화면 이동시)
router.push('path') 화면 이동시 에러발생
this.$router.push('path') 뒤에 <b>.catch(() => {});</b>를 붙혀서 에러 해결
