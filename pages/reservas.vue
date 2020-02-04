<template>
  <v-layout class="page-reservas" column justify-center align-center>
    <v-flex class="d-flex flex-column justify-center align-center" style="width: 100%">
      <h2 class="display-2 has-text-centered mb-1 font-weight-bold">Reservas</h2>
      <!-- <div class="has-text-centered mb-12">Atualize as informações do seu perfil ou modifique sua senha.</div> -->
      <div class="d-flex flex-row justify-space-around align-center pt-4" style="width: 90%; flex-grow: 1;">
        <v-tabs v-model="tab" :color="tab ? 'green' : ''" centered class="d-flex flex-column" style="height: 100%;">
          <v-tab>Não Confirmadas</v-tab>
          <v-tab>Confirmadas</v-tab>

          <v-tab-item v-for="(tabItem, index) in tabItems" :key="index">
            <v-card class="elevation-0">
              <v-card-title v-if="tabItem.status === 'pending'">
                <v-tooltip bottom>
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
              </v-card-title>
              <v-data-table :headers="tabItem.headers" :items="tabItem.items" :items-per-page="-1">
                <template v-slot:item="{ item }">
                  <tr
                    :class="{ 'blue lighten-5': item._dStatus === 'pending', 'green lighten-5': item._dStatus === 'confirmed' }"
                  >
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
                    <template v-if="tabItem.status === 'confirmed'">
                      <td class="text-start">
                        <div v-html="item._dStackPosition"></div>
                      </td>
                    </template>
                    <template v-else-if="tabItem.status === 'pending'">
                      <td class="text-start py-4">
                        <div v-for="(time, j) in item._dFullTime" :key="j">
                          {{ time }}
                        </div>
                      </td>
                    </template>
                    <td class="text-start">
                      <v-chip class="ma-1" x-small> {{ item.credit }} hora{{ item.credit > 1 ? 's' : '' }} </v-chip>
                    </td>
                    <template v-if="tabItem.status === 'pending'">
                      <td class="text-start">
                        <div v-if="item.maximum != 100" v-html="item._dVacancy"></div>
                        <v-icon v-else>mdi-infinity</v-icon>
                      </td>
                    </template>
                    <td class="text-start">
                      <v-tooltip v-if="item._dStatus === 'confirmed'" bottom>
                        <template v-slot:activator="{ on }">
                          <v-btn v-on="on" @click="confirmedDeselectItem(item)" icon>
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

                      <v-tooltip bottom>
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
      </div>
    </v-flex>
  </v-layout>
</template>

<script>
import _ from 'lodash'
import { getData, setData } from 'nuxt-storage/local-storage'
import { mapState, mapGetters, mapActions } from 'vuex'

import { LIST_TURMAS } from '~/utils/turmas'

export default {
  middleware: 'auth',
  data() {
    return {
      dialog: false,
      dialogData: undefined,
      tab: 0,
      search: undefined,
      headersPending: [
        {
          text: 'Atividade',
          align: 'left',
          value: 'name'
        },
        { text: 'Complementar/Eletiva', align: 'center', value: '_dTags' },
        { text: 'Horário', value: '_dWeekday' },
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
        { text: 'Carga Horária', value: 'credit' },
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
      ]
    }
  },
  mounted() {
    if (this.tab !== 1 && this.overview.pending.length === 0) {
      this.tab = 1
    }
  },
  methods: {
    ...mapActions('booking', ['select', 'deselect', 'confirm']),
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
      this.$toast.success('Confirmando reservas...')
      this.confirm()
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
