<template>
  <v-layout class="page-index pa-10" column justify-center align-center>
    <v-flex class="d-flex  flex-column justify-center align-center" style="width: 100%;">
      <h2 class="display-2 has-text-centered mb-8 font-weight-bold">Início</h2>
      <!-- <div class="has-text-centered mb-1">Primeiro, escolha um núcleo de matérias.</div> -->
      <div class="d-flex flex-row justify-space-around align-center pt-4" style="width: 90%; flex-grow: 1;">
        <v-tabs v-model="tab" centered class="d-flex flex-column" style="height: 100%;">
          <v-tab v-for="(core, index) in cores" :key="index" class="core">
            {{ core.name }}
          </v-tab>

          <v-tab-item v-for="(core, index) in cores" :key="index">
            <v-card class="elevation-0">
              <v-card-title>
                <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line hide-details></v-text-field>
                <v-tooltip bottom>
                  <template v-slot:activator="{ on }">
                    <v-btn
                      v-on="on"
                      @click="confirmBookings"
                      :disabled="overview.pending.length === 0"
                      class="ml-6"
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
                <v-tooltip bottom>
                  <template v-slot:activator="{ on }">
                    <v-btn
                      v-on="on"
                      v-show="overview.blocking.length > 0"
                      class="ml-2"
                      tile
                      depressed
                      color="amber lighten-5 amber--text"
                    >
                      <v-icon left>mdi-alert</v-icon>
                      Choque de Horário ({{ overview.blocking.length }})
                    </v-btn>
                  </template>
                  <span>
                    <b>Você possui atividades em conflito de horário:</b>
                    <div v-for="(booking, j) in overview.blocking" :key="j">
                      <span class="grey--text text--lighten-2">
                        ({{ (materias.find((m) => m._id === booking.materia) || {}).core }})
                      </span>

                      {{ (materias.find((m) => m._id === booking.materia) || {}).name }}
                    </div>
                  </span>
                </v-tooltip>
              </v-card-title>
              <v-data-table
                :headers="headers"
                :items="core.searchableMaterias"
                :items-per-page="itemsPerPage"
                :search="search"
                @update:items-per-page="updateItemsPerPage"
              >
                <template v-slot:item="{ item }">
                  <tr
                    :class="{
                      'blue lighten-5': item._dStatus === 'pending',
                      'green lighten-5': item._dStatus === 'confirmed',
                      'amber lighten-5': item._dStatus === 'blocking'
                    }"
                    :style="item._dUnallowedTurma ? 'opacity: 0.65' : ''"
                  >
                    <td class="text-left">{{ item.name }}</td>
                    <td class="text-start py-4">
                      <div v-for="(time, j) in item._dFullTime" :key="j">
                        {{ time }}
                      </div>
                    </td>
                    <td class="text-start">
                      <v-chip v-for="(turma, j) in item._dTurmas" :key="j" class="ma-1" x-small>
                        {{ turma }}
                      </v-chip>
                    </td>
                    <td class="text-start">
                      <div v-html="item._dVacancy"></div>
                    </td>
                    <td class="text-start">
                      <v-tooltip v-if="item.tags.includes('custo extra')" bottom>
                        <template v-slot:activator="{ on }">
                          <v-btn v-on="on" icon>
                            <v-icon color="red">mdi-currency-usd</v-icon>
                          </v-btn>
                        </template>
                        <span>Atividade com Custo Extra</span>
                      </v-tooltip>
                    </td>
                    <td class="text-start">
                      <v-tooltip v-if="item._dStatus === undefined" bottom>
                        <template v-slot:activator="{ on }">
                          <v-btn v-on="on" @click="() => (item._dUnallowedTurma ? () => {} : selectItem(item))" icon>
                            <v-icon v-if="!item._dUnallowedTurma">mdi-checkbox-blank-circle-outline</v-icon>
                            <v-icon v-else>mdi-cancel</v-icon>
                          </v-btn>
                        </template>
                        <span>{{
                          item._dUnallowedTurma ? 'Essa atividade não está disponível para sua turma' : 'Selecionar'
                        }}</span>
                      </v-tooltip>

                      <v-tooltip v-else-if="item._dStatus === 'confirmed'" bottom>
                        <template v-slot:activator="{ on }">
                          <v-btn v-on="on" @click="confirmedDeselectItem(item)" icon>
                            <v-icon color="green">mdi-check-all</v-icon>
                          </v-btn>
                        </template>
                        <span>Reserva Confirmada</span>
                      </v-tooltip>

                      <v-tooltip v-else-if="item._dStatus === 'pending'" bottom>
                        <template v-slot:activator="{ on }">
                          <v-btn v-on="on" @click="deselectItem(item)" icon>
                            <v-icon color="blue">mdi-check</v-icon>
                          </v-btn>
                        </template>
                        <span>Confirmação Pendente</span>
                      </v-tooltip>

                      <v-tooltip v-else-if="item._dStatus === 'blocking'" bottom>
                        <template v-slot:activator="{ on }">
                          <v-btn v-on="on" @click="deselectItem(item)" icon>
                            <v-icon color="amber darken-1">mdi-alert</v-icon>
                          </v-btn>
                        </template>
                        <span>
                          <b>Conflito de Horário</b>
                          <div v-for="(booking, j) in overview.blocking.filter((b) => b.materia !== item._id)" :key="j">
                            <span class="grey--text text--lighten-2">
                              ({{ (materias.find((m) => m._id === booking.materia) || {}).core }})
                            </span>

                            {{ (materias.find((m) => m._id === booking.materia) || {}).name }}
                          </div>
                        </span>
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

              <p>Caso no futuro você deseje se reinscrever nessa atividade, sua posição na fila de espera poderá ser maior.</p>
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
      tab: undefined,
      search: undefined,
      itemsPerPage: getData('itemsPerPage') || 5,
      headers: [
        {
          text: 'Atividade',
          align: 'left',
          value: 'name'
        },
        { text: 'Horário', value: '_dWeekday' },
        { text: 'Turmas', value: '_dTurmas' },
        { text: 'Vagas Disponíveis', value: '_dVacancy' },
        { text: 'Custo Extra', value: 'tags' },
        { text: 'Ações', value: 'action', sortable: false }
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
    cores() {
      return [
        {
          name: 'Núcleo Planck de Artes',
          searchableMaterias: this.searchableMaterias.filter((m) => m.core === 'Núcleo Planck de Artes')
        },
        {
          name: 'Núcleo Planck de Esportes',
          searchableMaterias: this.searchableMaterias.filter((m) => m.core === 'Núcleo Planck de Esportes')
        },
        {
          name: 'Núcleo Planck de Tecnologia',
          searchableMaterias: this.searchableMaterias.filter((m) => m.core === 'Núcleo Planck de Tecnologia')
        },
        {
          name: 'Planck Internacional',
          searchableMaterias: this.searchableMaterias.filter((m) => m.core === 'Planck Internacional')
        },
        {
          name: 'Programa Planck de Preparação Olímpica',
          searchableMaterias: this.searchableMaterias.filter((m) => m.core === 'Programa Planck de Preparação Olímpica')
        }
      ]
    },
    mappedSelectedItems() {
      return this.selected.map((booking) => this.materias.find((m) => m._id === booking.materia))
    },
    searchableMaterias() {
      return _.cloneDeep(this.materias)
        .map((m) => {
          m._dWeekday = m.weekday.map((day) => day.toString().toWeekday())
          m._dStartTime = m.starttime.map((time) => this.$moment('2019-01-19 ' + time).format('HH:mm'))
          m._dEndTime = m.endtime.map((time) => this.$moment('2019-01-19 ' + time).format('HH:mm'))
          m._dFullTime = m.weekday.map((_, i) => `${m._dWeekday[i]}, ${m._dStartTime[i]} às ${m._dEndTime[i]}`)

          m._dTurmas = (m.turmas || []).map((turma) => LIST_TURMAS[turma])

          const bookings = m.bookings.filter((b) => b.status === 1).length
          m._dVacancy = m.maximum - bookings
          if (m._dVacancy <= 0) {
            m._dVacancy = `<b class="mr-1">Fila de Espera</b><div class="grey--text text--darken-1">Posição Atual: ${m._dVacancy *
              -1 +
              1}</div>`
          } else {
            m._dVacancy = `<b>${m._dVacancy}</b>`
          }

          m._dStatus = undefined
          const booked = this.selected.find((booking) => booking.materia === m._id)
          if (booked) {
            if (this.overview.blocking.find((b) => b.materia === m._id)) m._dStatus = 'blocking'
            else m._dStatus = booked.status === 0 ? 'pending' : 'confirmed'
          }

          m._dUnallowedTurma = m.turmas !== null && !m.turmas.includes(this.$auth.user.turma)

          return m
        })
        .filter((m) => !m._dUnallowedTurma)
    }
  },
  methods: {
    ...mapActions('booking', ['select', 'deselect', 'confirm']),
    updateItemsPerPage(newVal) {
      this.itemsPerPage = newVal
      setData('itemsPerPage', this.itemsPerPage)
    },
    selectItem(item) {
      this.select(item._id)
    },
    confirmedDeselectItem(item) {
      this.dialog = true
      this.dialogData = item
    },
    deselectItem(item) {
      this.dialog = false
      this.deselect(item._id)
    },
    confirmBookings() {
      this.confirm()
    }
  }
}
</script>

<style lang="sass" scoped>
.page-index
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
