<template>
  <div id="app">
    <header>
      <navbar />
    </header>
    <transition name="fade" mode="out-in">
      <router-view/>
    </transition>
    <app-footer />
  </div>
</template>

<script>
import Navbar from '@/components/common/Navbar.vue';
import AppFooter from '@/components/common/Footer.vue';
import {components} from 'aws-amplify-vue';
export default {
  components: {
    Navbar,
    AppFooter,
    ...components
  }
}
</script>

<style lang="scss">
@import '@/scss/app.scss';
#app {
  height: 100%;
}
.content {
    min-height: 76vh;
}
</style>
