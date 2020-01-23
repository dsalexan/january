<template>
  <v-app>
    <v-container fluid class="pa-0 fill-height">
      <v-row no-gutters class="fill-height">
        <v-col cols="4" class="d-flex justify-center align-center">
          <nuxt />
        </v-col>
        <v-col cols="8" class="d-flex justify-center align-center showcase">
          <div class="headline font-weight-bold">
            <v-img :src="image" contain></v-img>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script>
export default {
  data() {
    return {
      image: require('@/assets/img/fundo1.png')
    }
  }
}
</script>

<style lang="sass" scoped>
.showcase
  background: rgb(255,180,25)
  background: radial-gradient(circle, rgba(255,180,25,1) 0%, rgba(207,137,0,1) 100%)
</style>
