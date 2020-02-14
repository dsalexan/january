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
                  href="http://167.172.246.25:3001/tutorial"
                  target="_blank"
                >
                  <v-icon :left="!miniVariant">mdi-help</v-icon>
                  <span v-if="!miniVariant">
                    Tutorial
                  </span>
                </v-btn>
              </template>
              <span>
                Tutorial
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
      <v-sheet class="text-center" height="600px">
        <v-stepper v-model="e6" editable>
          <v-stepper-header class="elevation-0 grey lighten-4">
            <v-stepper-step :complete="e6 > 1" step="1">
              Bem Vindo!
            </v-stepper-step>

            <v-divider></v-divider>
            <v-stepper-step :complete="e6 > 2" step="2">Início</v-stepper-step>

            <v-divider></v-divider>
            <v-stepper-step :complete="e6 > 3" step="3">Select an ad format and name ad unit</v-stepper-step>

            <v-divider></v-divider>
            <v-stepper-step step="4">View setup instructions</v-stepper-step>
          </v-stepper-header>

          <v-card class="elevation-0">
            <v-card-text class="elevation-0">
              <v-stepper-items>
                <v-stepper-content step="1">
                  <p class="display-1">Olá.</p>
                  <p>
                    Esse tutorial irá te apresentar como realizar a matrícula nas atividades extracurriculares do estudante de uma
                    forma simples e prática!
                  </p>
                </v-stepper-content>
                <v-stepper-content step="2">
                  <p>
                    É necessário buscar a atividade desejada dentro do respectivo Núcleo, por exemplo:
                  </p>
                  <p>Desenho está no Núcleo Planck Artes, Programação está no Núcleo Planck Tecnologia...</p>
                  <p>Um pouco de bom senso é sempre válido nesse momento!</p>
                </v-stepper-content>
                <v-stepper-content step="3">
                  <p>
                    Para iniciar a seleção das atividades vamos fazer um exemplo de matrícula:
                  </p>
                  <p>
                    Quero cursar a atividade de Física do P3O, por onde começo?
                  </p>
                  <ul>
                    <li>1- Clique no ícone do painel na aba lateral esquerda</li>
                    <li>2- Selecione o Núcleo Planck de Preparação Olímpica</li>
                    <li>3- Nessa aba busque pela atividade desejada</li>
                    <li>
                      <p>4- Ao selecionar verá que um “check” em azul aparecerá na matéria!</p>
                      <ul>
                        <li>a. É necessária a confirmação na matéria para que a inscrição seja realizada.</li>
                        <li>
                          b. Caso o período de matricula seja encerrado as matérias não confirmadas(“check” azul) não serão
                          consideradas.
                        </li>
                        <li>c. ATENÇÃO PARA OS PRAZOS!</li>
                      </ul>
                    </li>
                    <li>
                      <p>5- Confirme a reserva na atividade para se inscrever.</p>
                      <ul>
                        <li>
                          a. Caso o número de pessoas inscritas exceda a quantidade de vagas o estudante entrará na fila de espera
                          ao confirmar sua reserva.
                        </li>
                        <li>
                          b. A ordem de preenchimento de vagas para as atividades é feita por ordem de chegada e caso alguém
                          desista e/ou cancele a matrícula as posições de espera são atualizadas.
                        </li>
                      </ul>
                    </li>
                    <li>6- Aguarde o final do período de matrícula para receber um e-mail de confirmação!</li>
                  </ul>
                </v-stepper-content>
              </v-stepper-items>
            </v-card-text>
            <v-card-actions class="elevation-0">
              <v-btn @click="e6--" depressed icon color="grey lighten-1"> <v-icon>mdi-arrow-left</v-icon></v-btn>
              <v-spacer></v-spacer>
              <v-btn @click="e6++" depressed icon color="primary">
                <v-icon>mdi-arrow-right</v-icon>
              </v-btn>
            </v-card-actions>
          </v-card>
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
      bottomSheet: false,
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
