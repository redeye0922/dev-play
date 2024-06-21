# dev-play
프론트 개발 공간 
vue-play 추가
svelte-play 추가

# vue-router 화면이동시 에러 발생 (상세화면 이동시)
router.push('path') 화면 이동시 에러발생
this.$router.push('path') 뒤에 <b>.catch(() => {});</b>를 붙혀서 에러 해결

# 계산기 추가
router url "/" 를 계산기 화면으로 기존 "/"는 "/board"로 변경하여 처음화면에 계산기를 추가하였다

# 레이아웃 변경
Header 수정, Footer 추가
