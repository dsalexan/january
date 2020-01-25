<template>
  <section class="page-entrar section mx-10">
    <h2 class="title has-text-centered mb-6">Olá! Vamos começar nossa jornada?</h2>

    <form @submit.prevent="login" method="post">
      <div class="field mb-2">
        <div class="control">
          <v-text-field
            v-model="email"
            hide-details
            label="Email cadastrado"
            type="text"
            name="email"
            autocomplete="email"
            filled
          ></v-text-field>
        </div>
      </div>
      <div class="field mb-6">
        <div class="control">
          <v-text-field
            v-model="password"
            hide-details
            label="Senha"
            type="password"
            autocomplete="password"
            name="password"
            filled
          ></v-text-field>
        </div>
      </div>
      <div class="control">
        <v-btn :disabled="!isFormFilled" type="submit" block tile color="amber accent-4">Entrar</v-btn>
      </div>
    </form>
    <div class="has-text-centered mt-12" style="font-size: 1.1em; text-align: center">
      <p>É o seu primeiro acesso? <nuxt-link to="/cadastrar">Clique aqui!</nuxt-link></p>
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
  computed: {
    isFormFilled() {
      return !this.email.isEmpty() && !this.password.isEmpty()
    }
  },
  methods: {
    async login() {
      try {
        this.$toast.show('Entrando...')
        await this.$auth.loginWith('local', {
          data: {
            email: this.email,
            password: this.password
          }
        })

        if (this.$auth.user === false) {
          this.$toast.error('Falha na Autenticação')
        } else {
          this.$toast.success('Autenticado com Sucesso')

          this.$router.push(this.$auth.user.home || '/')
        }
      } catch (e) {
        this.error = e.response.data.error
        this.$toast.error(this.error)

        this.email = ''
        this.password = ''
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
