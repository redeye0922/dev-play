<template>
  <div>
    <b-navbar toggleable="lg" type="dark" variant="dark">
      <b-navbar-brand to="/">{{ pageName }}</b-navbar-brand>
      <b-navbar-toggle target="navbar-toggle-collapse">
        <template #default="{ expanded }">
          <b-icon v-if="expanded" icon="chevron-bar-up"></b-icon>
          <b-icon v-else icon="chevron-bar-down"></b-icon>
        </template>
      </b-navbar-toggle>

      <b-collapse id="navbar-toggle-collapse" is-nav>
        <b-navbar-nav class="ml-auto">
          <b-nav-item to="/" @click="navClick">메인페이지</b-nav-item>
          <b-nav-item to="/login" @click="navClick">로그인</b-nav-item>
          <b-nav-item to="/calculator" @click="navClick">계산기</b-nav-item>
          <b-nav-item to="/board" @click="navClick">자유게시판</b-nav-item>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
  </div>
</template>

<script>
export default {
  nama: "Header",
  data() {
    return {
      pageName: "메인페이지",
    };
  },
  methods: {
    navClick(event) {
      this.pageName = event.target.innerText;
    },
  },
};
</script>
