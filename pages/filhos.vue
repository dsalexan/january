<template>
  <v-layout class="page-perfil" column justify-center align-center>
    <v-flex class="d-flex flex-column justify-center align-center">
      <h2 class="display-2 has-text-centered mb-1 font-weight-bold">Filhos</h2>
      <div class="has-text-centered mb-12">Selecione o filho para qual deseja fazer as matriculas.</div>

      <form @submit.prevent="edit" method="put" class="mb-10">
        <div class="field mb-6">
          <div class="control">
            <v-select v-model="turma" :items="turmasSelect" label="Filho" hide-details filled></v-select>
          </div>
        </div>
        <div class="control">
          <v-btn :disabled="!isEditFormFilled" type="submit" block tile color="amber accent-4">Continuar</v-btn>
        </div>
      </form>

      <!-- <form @submit.prevent="changePassword" method="put">
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
      </form> -->
    </v-flex>
  </v-layout>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import { get } from 'lodash'
import { LIST_TURMAS } from '../utils/turmas'

export default {
  data() {
    return {
      name: this.$auth.user.name,
      email: this.$auth.user.email,
      turma: this.$store.state.student,
      password: '',
      confirm_password: '',
      current_password: '',
      error: null,
      turmasSelect: [
        { text: 'Aluno 1', value: '7ca0274b-9f32-4e00-be03-5e0e4a26808f' },

        { text: 'Aluno 2', value: '2f8c1a6d-802a-4dc7-8970-136093d177bc' }
      ]
    }
  },
  computed: {
    user() {
      return this.$auth.user
    },
    isEditFormFilled() {
      return !this.email.isEmpty() && !this.name.isEmpty() && this.turma !== undefined
    },
    isPasswordFormFilled() {
      return !this.current_password.isEmpty() && !this.password.isEmpty() && this.confirmedPassword
    },
    confirmedPassword() {
      return this.password === this.confirm_password
    }
  },
  methods: {
    ...mapMutations(['setStudent']),
    edit() {
      try {
        this.$toast.show('Salvando...')

        this.setStudent(this.turma)

        this.$toast.success('Filho selecionado com sucesso')
      } catch (e) {
        console.log('error', e)
        this.error = get(e, 'response.data.error')
        this.$toast.error(this.error)
      }
    },
    async changePassword() {
      try {
        this.$toast.show('Salvando...')

        await this.$axios.put(`me/password`, {
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
      this.turma = this.$auth.user.turma
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
