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
            <v-btn :fab="miniVariant" :color="nameColor" :text="!miniVariant">
              <span v-if="!miniVariant">Danilo Alexandre</span>
              <span v-else>DA</span>
            </v-btn>
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <v-divider></v-divider>

      <v-spacer></v-spacer>

      <v-spacer></v-spacer>

      <v-list>
        <v-list-item>
          <v-list-item-content>
            <v-tooltip right>
              <template v-slot:activator="{ on }">
                <v-btn @click="signOut()" v-on="on" :icon="miniVariant" :text="!miniVariant">
                  <v-icon left>mdi-logout-variant</v-icon>
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
      <v-container>
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
import debug from '@/utils/debug'

export default {
  data() {
    return {
      drawer: true,
      miniVariant: false,
      nameColor: ''
    }
  },
  methods: {
    toogleMenu() {
      this.miniVariant = !this.miniVariant
      this.nameColor = this.miniVariant ? 'white' : ''
      _.debounce(() => {
        this.nameColor = this.miniVariant ? 'grey lighten-4' : ''
      }, 120)()
    },
    signOut() {
      debug('Signing Out')
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
