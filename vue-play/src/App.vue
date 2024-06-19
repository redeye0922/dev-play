<template>
  <div id="app">
    <b-container>
      <Header />
      <router-view />
      <Footer />
    </b-container>
  </div>
</template>

<script>
import Header from "@/components/HeaderComp";
import Footer from "@/components/FooterComp";
export default {
  name: "App",
  components: {
    Header,
    Footer,
  },
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  text-align: center;
  color: #2c3e50;
}
</style>
