<template>
  <v-layout class="page-reservas" column justify-center align-center>
    <v-flex class="d-flex flex-column justify-center align-center" style="width: 100%">
      <h2 class="display-2 has-text-centered mb-1 font-weight-bold">Reservas</h2>
      <!-- <div class="has-text-centered mb-12">Atualize as informações do seu perfil ou modifique sua senha.</div> -->
      <div class="d-flex flex-row justify-space-around align-center pt-4" style="width: 90%; flex-grow: 1;">
        <v-tabs v-model="tab" :color="tab ? 'green' : ''" centered class="d-flex flex-column" style="height: 100%;">
          <v-tab v-for="(tabTab, index) in tabTabs" :key="index">{{ tabTabs[index] }}</v-tab>

          <v-tab-item v-for="(tabItem, index) in tabItems" :key="index">
            <v-card class="elevation-0">
              <v-card-title>
                <v-tooltip v-if="tabItems[index].status === 'pending'" bottom>
                  <template v-slot:activator="{ on }">
                    <v-btn
                      v-on="on"
                      @click="confirmBookings"
                      :disabled="overview.pending.length === 0"
                      tile
                      depressed
                      color="green lighten-5 green--text"
                    >
                      Confirmar Reservas ({{ overview.pending.length }})
                    </v-btn>
                  </template>
                  <span>
                    <div v-for="(booking, j) in overview.pending" :key="j">
                      <span class="grey--text text--lighten-2">
                        ({{ (materias.find((m) => m._id === booking.materia) || {}).core }})
                      </span>

                      {{ (materias.find((m) => m._id === booking.materia) || {}).name }}
                    </div>
                  </span>
                </v-tooltip>
                <v-tooltip v-else bottom>
                  <template v-slot:activator="{ on }">
                    <v-btn v-on="on" tile depressed color="amber lighten-5 amber--text">
                      <v-icon left>mdi-clock-outline</v-icon>
                      Rematrícula em Andamento
                    </v-btn>
                  </template>
                  <span style="text-align: center;">
                    <div>No momento a rematrícula está em andamento.</div>
                    <div>
                      Aguarde, ao final do período, o recebimento de um e-mail de acompanhamento da secretaria.
                    </div>
                  </span>
                </v-tooltip>
                <v-spacer></v-spacer>
                <template v-if="tabItems[index].status !== 'pending'">
                  <v-tooltip v-if="!$auth.user.finished" bottom>
                    <template v-slot:activator="{ on }">
                      <v-btn v-on="on" @click="dialogFinish = true" tile depressed color="green lighten-5 green--text">
                        <!-- <v-icon left>mdi-check</v-icon> -->
                        Finalizar
                      </v-btn>
                    </template>
                    <span>
                      <div>Finalize sua inscrição</div>
                      <div class="grey--text text--lighten-1 font-italic">Essa operação não poderá ser desfeita.</div>
                    </span>
                  </v-tooltip>
                  <v-tooltip v-else bottom>
                    <template v-slot:activator="{ on }">
                      <v-btn v-on="on" @click="dialogFinish = true" tile depressed color="grey lighten-5 black--text">
                        <!-- <v-icon left>mdi-check</v-icon> -->
                        Inscrição Finalizada
                      </v-btn>
                    </template>
                    <span>
                      <div class="grey--text text--lighten-2 font-italic">Sua inscrição foi finalizada.</div>
                    </span>
                  </v-tooltip>
                </template>
              </v-card-title>
              <v-data-table
                :headers="tabItems[index].headers"
                :items="tabItems[index].items"
                :items-per-page="-1"
                :custom-sort="customSort"
              >
                <template v-slot:item="{ item }">
                  <tr>
                    <!-- :class="{ 'blue lighten-5': item._dStatus === 'pending', 'green lighten-5': item._dStatus === 'confirmed' }" -->
                    <td class="text-left">{{ item.name }}</td>
                    <td class="text-center">
                      <v-tooltip v-if="item.tags.includes('custo extra')" bottom>
                        <template v-slot:activator="{ on }">
                          <v-btn v-on="on" icon>
                            <v-icon color="red">mdi-currency-usd</v-icon>
                          </v-btn>
                        </template>
                        <span>
                          Atividade Eletiva
                          <div class="grey--text text--lighten-2 font-italic">R$ 180,00</div>
                        </span>
                      </v-tooltip>
                      <v-tooltip v-else bottom>
                        <template v-slot:activator="{ on }">
                          <v-btn v-on="on" icon>
                            <v-icon color="blue">mdi-school</v-icon>
                          </v-btn>
                        </template>
                        <span>Atividade Complementar</span>
                      </v-tooltip>
                    </td>
                    <template v-if="tabItems[index].status === 'confirmed'">
                      <td class="text-start">
                        <div v-html="item._dStackPosition"></div>
                      </td>
                    </template>
                    <template v-else-if="tabItems[index].status === 'pending'">
                      <td class="text-start py-4">
                        <div v-for="(time, j) in item._dFullTime" :key="j">
                          {{ time }}
                        </div>
                      </td>
                    </template>
                    <td class="text-start">
                      <v-chip class="ma-1" x-small> {{ item.credit }} hora{{ item.credit > 1 ? 's' : '' }} </v-chip>
                    </td>
                    <template v-if="tabItems[index].status === 'pending'">
                      <td class="text-start">
                        <div v-if="item.maximum != 100" v-html="item._dVacancy"></div>
                        <v-icon v-else>mdi-infinity</v-icon>
                      </td>
                    </template>
                    <td class="text-start">
                      <v-tooltip v-if="item._dStatus === 'confirmed'" bottom>
                        <template v-slot:activator="{ on }">
                          <v-btn v-on="on" icon>
                            <v-icon color="green">mdi-check-all</v-icon>
                          </v-btn>
                        </template>
                        <span>Reserva Confirmada</span>
                      </v-tooltip>

                      <v-tooltip v-else-if="item._dStatus === 'pending'" bottom>
                        <template v-slot:activator="{ on }">
                          <v-btn v-on="on" icon>
                            <v-icon color="blue">mdi-check</v-icon>
                          </v-btn>
                        </template>
                        <span>Confirmação Pendente</span>
                      </v-tooltip>

                      <v-tooltip v-if="!$auth.user.finished" bottom>
                        <template v-slot:activator="{ on }">
                          <v-btn
                            v-on="on"
                            @click="() => (item._dStatus === 'confirmed' ? confirmedDeselectItem(item) : deselectItem(item))"
                            icon
                          >
                            <v-icon color="red">mdi-close</v-icon>
                          </v-btn>
                        </template>
                        <span>Remover</span>
                      </v-tooltip>
                    </td>
                  </tr>
                </template>
              </v-data-table>
            </v-card>
          </v-tab-item>
        </v-tabs>

        <v-dialog v-if="dialogData" v-model="dialog" max-width="350">
          <v-card>
            <v-card-title class="headline">Deseja cancelar sua reserva nessa aula?</v-card-title>

            <v-card-text>
              <p>
                Sua reserva está <b>confirmada</b> em <b>{{ dialogData.name }}</b
                >.
              </p>

              <p>Caso no futuro queira se reinscrever nessa atividade, sua posição na fila de espera poderá ser maior.</p>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>

              <v-btn @click="dialog = false" color="red darken-1" text>
                Cancelar
              </v-btn>

              <v-btn @click="deselectItem(dialogData)" color="green darken-1" text>
                Confirmar
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <v-dialog v-model="dialogFinish" max-width="350">
          <v-card>
            <v-card-title class="headline">Finalizar</v-card-title>

            <v-card-text>
              <p>Tem certeza que deseja confirmar as matrículas selecionadas?</p>
              <p>Essa operação não poderá ser cancelada.</p>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>

              <v-btn @click="dialogFinish = false" color="red darken-1" text>
                Cancelar
              </v-btn>

              <v-btn
                @click="
                  () => {
                    finish({ value: true })
                    dialogFinish = false
                    tab = 0
                  }
                "
                color="green darken-1"
                text
              >
                Confirmar
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </div>
    </v-flex>
  </v-layout>
</template>

<script>
import _ from 'lodash'
import { getData, setData } from 'nuxt-storage/local-storage'
import { mapState, mapGetters, mapActions } from 'vuex'

import { LIST_TURMAS } from '~/utils/turmas'

function _sort(_a, _b, { order = 'ASC', lowercase = false, uppercase = false } = {}) {
  let a = _a
  let b = _b

  if (lowercase) {
    a = typeof a === 'string' ? a.toLowerCase() : a
    b = typeof b === 'string' ? b.toLowerCase() : b
  }
  if (uppercase) {
    a = typeof a === 'string' ? a.toUpperCase() : a
    b = typeof b === 'string' ? b.toUpperCase() : b
  }

  if (b === a) return 0
  const c = b < a ? 1 : -1
  return order === 'ASC' ? c : -1 * c
}

export default {
  middleware: 'auth',
  data() {
    return {
      dialog: false,
      dialogData: undefined,
      dialogFinish: false,
      tab: 0,
      search: undefined,
      headersPending: [
        {
          text: 'Atividade',
          align: 'left',
          value: 'name'
        },
        { text: 'Complementar/Eletiva', align: 'center', value: '_dTags' },
        { text: 'Horário', value: 'weekday' },
        { text: 'Carga Horária', value: 'credit' },
        { text: 'Vagas Disponíveis', value: '_dVacancy' },
        { text: 'Ações', value: 'action', sortable: false }
      ],
      headersConfirmed: [
        {
          text: 'Atividade',
          align: 'left',
          value: 'name'
        },
        { text: 'Complementar/Eletiva', align: 'center', value: '_dTags' },
        { text: 'Situação', value: '_dStackPosition' },
        { text: 'Carga Horária - Semanal', value: 'credit' },
        { text: 'Ações', value: 'tags', sortable: false }
      ]
    }
  },
  computed: {
    ...mapState('booking', {
      selected: 'list'
    }),
    ...mapGetters('booking', ['overview']),
    ...mapState('materias', {
      materias: 'list'
    }),
    mappedSelectedItems() {
      return this.selected.map((booking) => this.materias.find((m) => m._id === booking.materia))
    },
    searchableMaterias() {
      return _.cloneDeep(this.materias).map((m) => {
        m._dWeekday = m.weekday.map((day) => day.toString().toWeekday())
        m._dStartTime = m.starttime.map((time) => this.$moment('2019-01-19 ' + time).format('HH:mm'))
        m._dEndTime = m.endtime.map((time) => this.$moment('2019-01-19 ' + time).format('HH:mm'))
        m._dFullTime = m.weekday.map((_, i) => `${m._dWeekday[i]}, ${m._dStartTime[i]} as ${m._dEndTime[i]}`)

        m._dTurmas = (m.turmas || []).map((turma) => LIST_TURMAS[turma])

        const bookings = m.bookings.filter((b) => b.status === 1).length
        m._dVacancy = m.maximum - bookings
        if (m._dVacancy <= 0) {
          m._dVacancy = `<b class="mr-1">Fila de Espera</b><div class="grey--text text--darken-1">Posição Atual: ${m._dVacancy *
            -1 +
            1}</div>`
        } else {
          // m._dVacancy = `<b>${m._dVacancy}</b>`
          // eslint-disable-next-line eqeqeq
          m._dVacancy = `<b>${m.maximum == 100 ? '<v-icon>mdi-infinity</v-icon>' : m._dVacancy}</b>`
        }

        m._dStatus = undefined
        m._dStackPosition = null
        const booked = this.selected.find((booking) => booking.materia === m._id)
        if (booked) {
          if (this.overview.blocking.find((b) => b.booking.materia === m._id)) m._dStatus = 'blocking'
          else m._dStatus = booked.status === 0 ? 'pending' : 'confirmed'
          m._dStackPosition =
            booked.position <= m.maximum
              ? '<b>Inscrito</b>'
              : `<b class="mr-1">Fila de Espera</b>(${booked.position - m.maximum})`
        }

        return m
      })
    },
    tabTabs() {
      return ['Lista de Espera', 'Finalizar Matrícula'].filter((e, index) => !this.$auth.user.finished || index === 1)
    },
    tabItems() {
      return [
        {
          status: 'pending',
          items: this.searchableMaterias.filter((materia) => materia._dStatus === 'pending'),
          headers: this.headersPending
        },
        {
          status: 'confirmed',
          items: this.searchableMaterias.filter((materia) => materia._dStatus === 'confirmed'),
          headers: this.headersConfirmed
        }
      ].filter((e, index) => !this.$auth.user.finished || index === 1)
    }
  },
  mounted() {
    const self = this
    this.$auth.fetchUser().then(() => {
      if (self.tab !== 1 && self.overview.pending.length === 0 && !self.$auth.user.finished) {
        self.tab = 1
      }
    })
  },
  methods: {
    ...mapActions('booking', ['select', 'deselect', 'confirm']),
    ...mapActions(['finish']),
    updateItemsPerPage(newVal) {
      this.itemsPerPage = newVal
      setData('itemsPerPage', this.itemsPerPage)
    },
    selectItem(item) {
      this.$toast.show(`Selecionando "${item.name}"...`)
      this.select(item._id)
    },
    confirmedDeselectItem(item) {
      this.dialog = true
      this.dialogData = item
    },
    deselectItem(item) {
      this.$toast.show(`Cancelando reserva "${item.name}"...`)
      this.dialog = false
      this.deselect(item._id)
    },
    confirmBookings() {
      this.$toast.show('Confirmando reservas...')
      this.confirm()
      this.$toast.success('Reserva confirmada! Para finalizar sua inscrição, entre em Reservas > Finalizar Matrícula', {
        duration: 7000
      })
    },
    customSort(items, sortBy, sortDesc, locale, customSorters) {
      if (sortBy.length > 0) {
        sortBy.map((key, index) =>
          items.sort((a, b) => {
            let _a = typeof a[key] === 'string' ? a[key].replace(/<[^>]*>/g, '') : a[key]
            let _b = typeof b[key] === 'string' ? b[key].replace(/<[^>]*>/g, '') : b[key]

            if (key === '_dVacancy') {
              _a = parseInt(_a)
              _b = parseInt(_b)
            }

            return _sort(_a, _b, { order: sortDesc[index] ? 'ASC' : 'DESC' })
          })
        )
      }
      return items
    }
  }
}
</script>

<style lang="sass" scoped>
.page-reservas
  .v-tabs::v-deep
    > .v-tabs-bar
      background: transparent

      .v-tabs-slider-wrapper
        display: none

      .v-tab
        max-width: 420px

        &.v-tab--active
          background: white

    > .v-tabs-items
      flex-grow: 1

      .v-window__container
        height: 100%
        display: flex
        flex-direction: column

        .v-window-item
          flex-grow: 1

          .v-card
            height: 100%
            display: flex
            flex-direction: column

            .v-data-table
              flex-grow: 1

            .v-data-table
              display: flex
              flex-direction: column

              .v-data-table__wrapper
                flex-grow: 1

              .v-data-table__selected
                background: #E8F5E9
</style>
