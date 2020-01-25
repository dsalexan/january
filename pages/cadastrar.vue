<template>
  <section class="page-cadastrar section mx-10">
    <h2 class="title has-text-centered mb-6">Cadastre-se!</h2>

    <form @submit.prevent="register" method="post">
      <div class="field mb-2">
        <div class="control">
          <v-text-field
            v-model="name"
            hide-details
            label="Nome"
            type="text"
            autocomplete="Nome"
            name="name"
            filled
            required
          ></v-text-field>
        </div>
      </div>
      <div class="field mb-2">
        <div class="control">
          <v-text-field
            v-model="email"
            hide-details
            label="Email"
            type="email"
            name="email"
            autocomplete="email"
            filled
            required
          ></v-text-field>
        </div>
      </div>
      <div class="field mb-2">
        <div class="control">
          <v-select v-model="turma" :items="turmasSelect" label="Turma" hide-details filled></v-select>
        </div>
      </div>
      <div class="field mb-2">
        <div class="control">
          <v-text-field
            v-model="password"
            hide-details
            label="Senha"
            type="password"
            name="password"
            autocomplete="password"
            filled
            required
          ></v-text-field>
        </div>
      </div>
      <div class="field mb-6">
        <div class="control">
          <v-text-field
            v-model="confirm_password"
            :hide-details="confirmedPassword"
            :error-messages="!confirmedPassword ? ['A confirmação de senha está incorreta'] : []"
            label="Confirme a Senha"
            type="password"
            name="confirm-password"
            autocomplete="password"
            filled
            required
          ></v-text-field>
        </div>
      </div>
      <div class="control">
        <v-btn :disabled="!isFormFilled" type="submit" block tile color="amber accent-4">Confirmar</v-btn>
      </div>
    </form>

    <div class="has-text-centered mt-12" style="font-size: 0.8em; text-align: center">
      Já tem uma conta? <nuxt-link to="/entrar">Entrar</nuxt-link>
    </div>
  </section>
</template>

<script>
import { LIST_TURMAS } from '../utils/turmas'
export default {
  layout: 'empty',
  data() {
    return {
      name: '',
      email: '',
      turma: undefined,
      password: '',
      confirm_password: '',
      error: null,
      turmasSelect: LIST_TURMAS.map((t, i) => ({
        text: t,
        value: i
      }))
    }
  },
  computed: {
    isFormFilled() {
      return (
        !this.email.isEmpty() &&
        this.turma !== undefined &&
        !this.password.isEmpty() &&
        !this.name.isEmpty() &&
        this.confirmedPassword
      )
    },
    confirmedPassword() {
      return this.password === this.confirm_password
    }
  },
  methods: {
    async register() {
      try {
        this.$toast.show('Cadastrando...')

        await this.$axios.post('auth/register', {
          name: this.name,
          email: this.email,
          turma: this.turma,
          password: this.password
        })

        this.$toast.show('Entrando...')

        await this.$auth.loginWith('local', {
          data: {
            email: this.email,
            password: this.password
          }
        })
        this.$toast.success('Autenticado com Sucesso')

        this.$router.push(this.$auth.user.home || '/')
      } catch (e) {
        this.error = e.response.data.error
        this.$toast.error(this.error)
      }
    }
  }
}
</script>

<style lang="sass" scoped>
.page-cadastrar
  width: 100%
  max-width: 400px
</style>
