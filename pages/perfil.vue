<template>
  <v-layout class="page-perfil" column justify-center align-center>
    <v-flex class="d-flex flex-column justify-center align-center">
      <h2 class="display-2 has-text-centered mb-1 font-weight-bold">Perfil</h2>
      <div class="has-text-centered mb-12">Atualize as informações do seu perfil ou modifique sua senha.</div>

      <form @submit.prevent="edit" method="put" class="mb-10">
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
        <div class="field mb-6">
          <div class="control">
            <v-text-field
              v-model="email"
              hide-details
              label="Email"
              type="text"
              name="email"
              autocomplete="email"
              filled
              required
            ></v-text-field>
          </div>
        </div>
        <div class="control">
          <v-btn :disabled="!isEditFormFilled" type="submit" block tile color="amber accent-4">Atualizar</v-btn>
        </div>
      </form>

      <form @submit.prevent="changePassword" method="put">
        <div class="field mb-6">
          <div class="control">
            <v-text-field
              v-model="current_password"
              hide-details
              label="Senha Atual"
              type="password"
              name="password"
              autocomplete="current-password"
              filled
              required
            ></v-text-field>
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
              autocomplete="new-password"
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
              name="new-password"
              autocomplete="password"
              filled
              required
            ></v-text-field>
          </div>
        </div>
        <div class="control">
          <v-btn :disabled="!isPasswordFormFilled" type="submit" block tile color="amber accent-4">Alterar Senha</v-btn>
        </div>
      </form>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  data() {
    return {
      name: this.$auth.user.name,
      email: this.$auth.user.email,
      password: '',
      confirm_password: '',
      current_password: '',
      error: null
    }
  },
  computed: {
    user() {
      return this.$auth.user
    },
    isEditFormFilled() {
      return !this.email.isEmpty() && !this.name.isEmpty()
    },
    isPasswordFormFilled() {
      return !this.current_password.isEmpty() && !this.password.isEmpty() && this.confirmedPassword
    },
    confirmedPassword() {
      return this.password === this.confirm_password
    }
  },
  methods: {
    async modify() {
      try {
        this.$toast.show('Cadastrando...')

        await this.$axios.post('auth/register', {
          name: this.name,
          email: this.email,
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

        this.$router.push('/')
      } catch (e) {
        this.error = e.response.data.error
        this.$toast.error(this.error)
      }
    },
    async edit() {
      try {
        this.$toast.show('Salvando...')

        await this.$axios.put(`auth/me`, {
          email: this.email,
          name: this.name
        })

        this.$toast.success('Dados alterados com Sucesso')

        await this.$auth.fetchUser()
      } catch (e) {
        this.error = e.response.data.error
        this.$toast.error(this.error)
      }

      this.resetForm()
    },
    async changePassword() {
      try {
        this.$toast.show('Salvando...')

        await this.$axios.put(`auth/me/password`, {
          new_password: this.password,
          current_password: this.current_password
        })

        this.$toast.success('Senha alterada com Sucesso')
      } catch (e) {
        this.error = e.response.data.error
        this.$toast.error(this.error)
      }

      this.resetForm()
    },
    resetForm() {
      this.email = this.$auth.user.email
      this.name = this.$auth.user.name
      this.current_password = ''
      this.password = ''
      this.confirm_password = ''
    }
  }
}
</script>

<style lang="sass" scoped>
.page-perfil
  form
    background: #fff
    padding: 50px 70px
    border-radius: 5px
    border: solid thin
    border-color: rgba(0, 0, 0, 0.12)

    .v-text-field::v-deep
      width: 400px
</style>
