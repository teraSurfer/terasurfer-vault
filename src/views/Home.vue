<template>
  <div class="home">
    <banner />
  </div>
</template>

<script>
// @ is an alias to /src
import Banner from '@/components/home/Banner.vue'

export default {
  name: 'home',
  components: {
    Banner
  }
}
</script>
