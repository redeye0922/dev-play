<template>
  <div class="login-cnt">
    <LoginForm />
  </div>
</template>

<script>
import LoginForm from "@/components/login/LoginForm";
export default {
  components: {
    LoginForm,
  },
  data() {
    return {};
  },
  methods: {
    Login() {
      this.$router.push({
        path: "/",
      });
    },
  },
};
</script>

<style>
.login-cnt {
}
.login-sns {
}
</style>
