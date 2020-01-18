<template>
  <section class="page-entrar section mx-10">
    <h2 class="title has-text-centered mb-4">Bem Vindo</h2>

    <form @submit.prevent="login" method="post">
      <div class="field mb-4">
        <div class="control">
          <v-text-field v-model="email" hide-details label="Email" type="email" name="email" filled></v-text-field>
        </div>
      </div>
      <div class="field mb-4">
        <div class="control">
          <v-text-field v-model="password" hide-details label="Password" type="password" name="password" filled></v-text-field>
        </div>
      </div>
      <div class="control">
        <v-btn type="submit" block tile color="amber accent-4">Entrar</v-btn>
      </div>
    </form>
    <div class="has-text-centered mt-12" style="font-size: 0.8em; text-align: center">
      <p>Não tem uma conta? <nuxt-link to="/cadastrar">Cadastre-se</nuxt-link></p>
    </div>
  </section>
</template>

<script>
export default {
  layout: 'empty',
  data() {
    return {
      email: '',
      password: '',
      error: null
    }
  },

  methods: {
    async login() {
      try {
        this.$toast.show('Logando...')
        await this.$auth.loginWith('local', {
          data: {
            email: this.email,
            password: this.password
          }
        })
        this.$toast.success('Autenticado com Sucesso')

        this.$router.push('/')
      } catch (e) {
        this.error = e.response.data.message
        this.$toast.error(this.error)
      }
    }
  }
}
</script>

<style lang="sass" scoped>
.page-entrar
  width: 100%
  max-width: 400px
</style>
