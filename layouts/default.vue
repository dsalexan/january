<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" :mini-variant="miniVariant" clipped persistent fixed app>
      <v-list>
        <v-list-item>
          <v-list-item-action>
            <v-tooltip right>
              <template v-slot:activator="{ on }">
                <v-btn v-on="on" @click.stop="toogleMenu()" icon>
                  <v-icon>mdi-menu</v-icon>
                </v-btn>
              </template>
              <span>{{ miniVariant ? 'Expandir Menu' : 'Esconder Menu' }}</span>
            </v-tooltip>
          </v-list-item-action>
        </v-list-item>
      </v-list>
      <v-list>
        <v-list-item>
          <v-list-item-content>
            <v-tooltip right>
              <template v-slot:activator="{ on }">
                <v-btn
                  v-on="on"
                  :fab="miniVariant"
                  :icon="miniVariant"
                  :text="!miniVariant"
                  :color="$route.name === 'perfil' ? 'blue accent-4' : ''"
                  to="/perfil"
                  nuxt
                >
                  <span v-if="!miniVariant" style="color: black!important">{{ userName }}</span>
                  <span v-else style="color: black!important">{{ userAbbreviation }}</span>
                </v-btn>
              </template>
              <span>Meu Perfil</span>
            </v-tooltip>
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <v-divider></v-divider>

      <v-spacer></v-spacer>

      <v-list>
        <v-list-item v-if="hasPage('home')">
          <v-list-item-content>
            <v-tooltip right>
              <template v-slot:activator="{ on }">
                <v-btn
                  v-on="on"
                  :fab="miniVariant"
                  :icon="miniVariant"
                  :text="!miniVariant"
                  :color="$route.name === 'index' ? 'blue accent-4' : ''"
                  to="/"
                  nuxt
                >
                  <v-badge
                    :color="overview.blocking.length ? `red darken-1` : ''"
                    :value="miniVariant && overview.quantity"
                    overlap
                    dot
                  >
                    <v-icon :left="!miniVariant">mdi-home</v-icon>
                  </v-badge>
                  <span v-if="!miniVariant">
                    <v-badge :color="overview.blocking.length ? `red darken-1` : ''" class="small-badge" dot>
                      Início
                    </v-badge>
                  </span>
                </v-btn>
              </template>
              <span>
                <div style="width: 100%; text-align: center;">
                  Início
                  <div v-if="overview.blocking.length" class="amber--text text--lighten-2">
                    <b>{{ overview.blocking.length }}</b> Conflito{{ overview.blocking.length > 1 ? 's' : '' }}
                  </div>
                </div>
              </span>
            </v-tooltip>
          </v-list-item-content>
        </v-list-item>
        <v-list-item v-if="hasPage('reservas')">
          <v-list-item-content>
            <v-tooltip right>
              <template v-slot:activator="{ on }">
                <v-btn
                  v-on="on"
                  :fab="miniVariant"
                  :icon="miniVariant"
                  :text="!miniVariant"
                  :color="$route.name === 'reservas' ? 'blue accent-4' : ''"
                  to="/reservas"
                  nuxt
                >
                  <v-badge
                    :color="overview.pending.length ? `red darken-1` : ''"
                    :value="miniVariant && overview.quantity"
                    overlap
                    dot
                  >
                    <v-icon :left="!miniVariant">mdi-bookmark</v-icon>
                  </v-badge>
                  <span v-if="!miniVariant">
                    <v-badge :color="overview.pending.length ? `red darken-1` : ''" class="small-badge" dot>
                      Reservas
                    </v-badge>
                  </span>
                </v-btn>
              </template>
              <span>
                <div style="width: 100%; text-align: center;">
                  Minhas Reservas
                  <div v-if="overview.pending.length" class="blue--text text--lighten-3">
                    <b>{{ overview.pending.length }}</b> Pendência{{ overview.pending.length > 1 ? 's' : '' }}
                  </div>
                </div>
              </span>
            </v-tooltip>
          </v-list-item-content>
        </v-list-item>
        <v-list-item v-for="(page, x) in otherPages" :key="x">
          <v-list-item-content>
            <v-tooltip right>
              <template v-slot:activator="{ on }">
                <v-btn
                  v-on="on"
                  :fab="miniVariant"
                  :icon="miniVariant"
                  :text="!miniVariant"
                  :color="$route.name === page.route ? 'blue accent-4' : ''"
                  :to="`/${page.route}`"
                  nuxt
                >
                  <v-icon :left="!miniVariant">mdi-{{ page.icon }}</v-icon>
                  <span v-if="!miniVariant">
                    {{ page.name }}
                  </span>
                </v-btn>
              </template>
              <span>
                <div style="width: 100%; text-align: center;">
                  {{ page.label }}
                </div>
              </span>
            </v-tooltip>
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <v-spacer></v-spacer>

      <v-list>
        <v-list-item>
          <v-list-item-content>
            <v-tooltip right>
              <template v-slot:activator="{ on }">
                <v-btn @click="signOut()" v-on="on" :fab="miniVariant" :icon="miniVariant" :text="!miniVariant">
                  <v-icon :left="!miniVariant">mdi-logout-variant</v-icon>
                  <span v-if="!miniVariant">Sair</span>
                </v-btn>
              </template>
              <span>Sair</span>
            </v-tooltip>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-content>
      <v-container class="fill-height" style="max-width: 100%">
        <nuxt />
      </v-container>
    </v-content>
    <v-footer app>
      <div class="d-flex justify-center" style="width: 100%">
        <span class="caption">2020 &mdash; <b>Colégio Planck</b></span>
      </div>
    </v-footer>

    <v-bottom-sheet v-model="bottomSheet" inset>
      <v-sheet class="text-center" height="300px">
        <v-stepper v-model="e6" vertical editable>
          <!-- 1 -->
          <v-stepper-step :complete="e6 > 1" step="1">
            Bem Vindo!
          </v-stepper-step>

          <v-stepper-content step="1">
            <v-card color="grey lighten-1" class="mb-12" height="200px">
              <p>Olá</p>
              <p>
                Esse tutorial irá te apresentar como realizar a matrícula nas atividades extracurriculares do estudante de uma
                forma simples e prática!
              </p>
            </v-card>
            <v-btn @click="e6 = 2" color="primary">Continuar</v-btn>
            <v-btn @click="e6--" color="grey">Voltar</v-btn>
          </v-stepper-content>

          <v-stepper-step :complete="e6 > 2" step="2">Configure analytics for this app</v-stepper-step>

          <v-stepper-content step="2">
            <v-card color="grey lighten-1" class="mb-12" height="200px"></v-card>
            <v-btn @click="e6 = 3" color="primary">Continue</v-btn>
            <v-btn text>Cancel</v-btn>
          </v-stepper-content>

          <v-stepper-step :complete="e6 > 3" step="3">Select an ad format and name ad unit</v-stepper-step>

          <v-stepper-content step="3">
            <v-card color="grey lighten-1" class="mb-12" height="200px"></v-card>
            <v-btn @click="e6 = 4" color="primary">Continue</v-btn>
            <v-btn text>Cancel</v-btn>
          </v-stepper-content>

          <v-stepper-step step="4">View setup instructions</v-stepper-step>
          <v-stepper-content step="4">
            <v-card color="grey lighten-1" class="mb-12" height="200px"></v-card>
            <v-btn @click="e6 = 1" color="primary">Continue</v-btn>
            <v-btn text>Cancel</v-btn>
          </v-stepper-content>
        </v-stepper>
      </v-sheet>
    </v-bottom-sheet>
  </v-app>
</template>

<script>
import _ from 'lodash'
import { mapState, mapGetters, mapActions } from 'vuex'
import { getData, setData } from 'nuxt-storage/local-storage'
import debug from '@/utils/debug'

export default {
  data() {
    return {
      drawer: true,
      miniVariant: getData('collapsedMenu') || false,
      bottomSheet: true,
      e6: 1
    }
  },
  computed: {
    ...mapState('auth', ['user']),
    ...mapGetters('booking', ['overview']),
    userName() {
      return this.user.name
    },
    userAbbreviation() {
      return this.user.name
        .trim()
        .split(' ')
        .map((n) => n[0])
        .join('')
    },
    otherPages() {
      return (this.user.pages || []).filter((page) => page.route !== 'home' && page.route !== 'reservas')
    },
    hasPage() {
      return (route) => (this.user.pages || []).find((page) => page.route === route)
    }
  },
  created() {
    this.initMaterias()
    this.initBookings()
  },
  methods: {
    ...mapActions('materias', {
      initMaterias: 'init'
    }),
    ...mapActions('booking', {
      initBookings: 'init'
    }),
    toogleMenu() {
      this.miniVariant = !this.miniVariant
      setData('collapsedMenu', this.miniVariant)
    },
    async signOut() {
      this.$toast.show('Saindo...')
      await this.$auth.logout('local')

      this.$router.push('/')
    }
  }
}
</script>

<style lang="sass" scoped>
.v-navigation-drawer::v-deep
  & > .v-navigation-drawer__content
    display: flex
    flex-direction: column

  .v-btn
    &.v-btn--fab
      height: 48px !important
      width: 48px !important
      box-shadow: none

.small-badge::v-deep
  .v-badge__badge
    height: 5px
    width: 5px
</style>
