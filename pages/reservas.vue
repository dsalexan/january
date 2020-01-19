<template>
  <v-layout class="page-reserva" column justify-center align-center>
    <v-flex class="d-flex flex-column justify-center align-center">
      <h2 class="display-2 has-text-centered mb-1 font-weight-bold">Reservas</h2>
      <!-- <div class="has-text-centered mb-12">Atualize as informações do seu perfil ou modifique sua senha.</div> -->
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  middleware: 'auth'
}
</script>

<style lang="sass" scoped>
.page-reservas
</style>
