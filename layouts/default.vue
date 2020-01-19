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
                  :color="$route.name === 'perfil' ? 'amber accent-4' : ''"
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
        <v-list-item>
          <v-list-item-content>
            <v-tooltip right>
              <template v-slot:activator="{ on }">
                <v-btn
                  v-on="on"
                  :fab="miniVariant"
                  :icon="miniVariant"
                  :text="!miniVariant"
                  :color="$route.name === 'index' ? 'amber accent-4' : ''"
                  to="/"
                  nuxt
                >
                  <v-icon :left="!miniVariant">mdi-home</v-icon>
                  <span v-if="!miniVariant">Início</span>
                </v-btn>
              </template>
              <span>Início</span>
            </v-tooltip>
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-content>
            <v-tooltip right>
              <template v-slot:activator="{ on }">
                <v-btn
                  v-on="on"
                  :fab="miniVariant"
                  :icon="miniVariant"
                  :text="!miniVariant"
                  :color="$route.name === 'reservas' ? 'amber accent-4' : ''"
                  to="/reservas"
                  nuxt
                >
                  <v-badge :color="`${bookingColor} darken-1`" :value="miniVariant && overview.quantity" overlap dot>
                    <v-icon :left="!miniVariant">mdi-bookmark</v-icon>
                  </v-badge>
                  <span v-if="!miniVariant">Reservas</span>
                </v-btn>
              </template>
              <span>Minhas Reservas</span>
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
      <v-container class="fill-height">
        <nuxt />
      </v-container>
    </v-content>
    <v-footer app>
      <div class="d-flex justify-center" style="width: 100%">
        <span class="caption">2020 &mdash; <b>January Project</b></span>
      </div>
    </v-footer>
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
      miniVariant: getData('collapsedMenu') || false
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
    bookingColor() {
      if (this.overview.state === 'waiting') {
        return 'blue'
      } else if (this.overview.state === 'problem') {
        return 'red'
      } else {
        return 'green'
      }
    }
  },
  created() {
    this.initMaterias()
  },
  methods: {
    ...mapActions('materias', {
      initMaterias: 'init'
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
</style>
