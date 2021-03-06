<template>
  <v-layout class="page-index pa-10" column justify-center align-center>
    <v-flex class="d-flex  flex-column justify-center align-center" style="width: 100%;">
      <h2 class="display-2 has-text-centered mb-8 font-weight-bold">Matrícula nas Atividades Extracurriculares</h2>
      <!-- <div class="has-text-centered mb-1">Primeiro, escolha um núcleo de matérias.</div> -->
      <div class="d-flex flex-row justify-space-around align-center pt-4" style="width: 100%; flex-grow: 1;">
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
                      @click="choqueHorario"
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
                        ({{ (materias.find((m) => m._id === booking.booking.materia) || {}).core }})
                      </span>

                      {{ (materias.find((m) => m._id === booking.booking.materia) || {}).name }}
                    </div>
                  </span>
                </v-tooltip>
              </v-card-title>
              <v-data-table
                :headers="headers"
                :items="core.searchableMaterias"
                :search="search"
                :items-per-page="-1"
                :custom-sort="customSort"
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
                    <td class="text-start py-4">
                      <div v-for="(day, j) in item._dWeekday" :key="j">
                        {{ day }}
                      </div>
                    </td>
                    <td class="text-start py-4">
                      <div v-for="(time, j) in item._dFullTime" :key="j">
                        {{ time }}
                      </div>
                    </td>
                    <td class="text-start">
                      <v-chip class="ma-1" x-small> {{ item.credit }} hora{{ item.credit > 1 ? 's' : '' }} </v-chip>
                    </td>
                    <td class="text-start">
                      {{ item.minimum === 0 ? '' : item.minimum }}
                    </td>
                    <td class="text-start">
                      <template v-if="item.maximum !== 100">{{ item.maximum }}</template>
                      <v-icon v-else>mdi-infinity</v-icon>
                    </td>
                    <td class="text-start">
                      <div v-if="item.maximum != 100" v-html="item._dVacancy"></div>
                      <v-icon v-else>mdi-infinity</v-icon>
                    </td>
                    <td class="text-start">
                      <v-tooltip v-if="item._dStatus === undefined" bottom>
                        <template v-slot:activator="{ on }">
                          <v-btn
                            v-on="on"
                            @click="() => (item._dUnallowedTurma || item._dFinished ? () => {} : selectItem(item))"
                            icon
                          >
                            <v-icon v-if="!item._dUnallowedTurma && !item._dFinished">mdi-checkbox-blank-circle-outline</v-icon>
                            <v-icon v-else>mdi-cancel</v-icon>
                          </v-btn>
                        </template>
                        <span>{{
                          item._dUnallowedTurma
                            ? 'Essa atividade não está disponível para sua turma'
                            : item._dFinished
                            ? 'Inscrições Encerradas'
                            : 'Selecionar'
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
                          <div
                            v-for="(booking, j) in overview.blocking
                              .map((b) => {
                                if (b.booking.materia !== item._id) return []
                                else return b.blockedBy
                              })
                              .flat(1)"
                            :key="j"
                          >
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
  middleware: ['auth', 'finished'],
  data() {
    return {
      dialog: false,
      dialogData: undefined,
      tab: undefined,
      search: undefined,
      headers: [
        {
          text: 'Atividade',
          align: 'left',
          value: 'name'
        },
        { text: 'Complementar/Eletiva', align: 'center', value: '_dTags' },
        { text: 'Dia da Semana', value: 'weekday' },
        { text: 'Horário', value: '_dFullTime' },
        { text: 'Carga Horária - Semanal', value: 'credit' },
        { text: 'Min', value: 'minimum' },
        { text: 'Máx', value: 'maximum' },
        { text: 'Vagas Disponíveis', value: '_dVacancy' },
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
          m._dFullTime = m.weekday.map((_, i) => `${m._dStartTime[i]} até ${m._dEndTime[i]}`)
          m._dFinished = m.maximum === m.inscritos
          // NOME ATIVIDADE | ATIVIDADE COMPLEMENTAR | ATIVIDADE ELETIVA | DIA DA SEMANA | HORÁRIO | MIN | MAX | VAGAS DISPONÍVEIS | AÇÕES.

          m._dTurmas = (m.turmas || []).map((turma) => LIST_TURMAS[turma])

          const bookings = m.bookings.filter((b) => b.status === 1).length
          m._dVacancy = m.maximum - bookings - m.inscritos
          if (m._dVacancy < 0) {
            if (m._dFinished) {
              m._dVacancy = `<b class="mr-1 red--text text--darken-1">Inscrições Encerradas</b>`
            } else {
              m._dVacancy = `<b class="mr-1">Fila de Espera</b><div class="grey--text text--darken-1">Posição Atual: ${m._dVacancy *
                -1 +
                1}</div>`
            }
          } else {
            // eslint-disable-next-line eqeqeq
            m._dVacancy = `<b>${m.maximum == 100 ? '<v-icon>mdi-infinity</v-icon>' : m._dVacancy}</b>`
          }

          m._dStatus = undefined
          const booked = this.selected.find((booking) => booking.materia === m._id)
          if (booked) {
            if (this.overview.blocking.find((b) => b.booking.materia === m._id)) m._dStatus = 'blocking'
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
    choqueHorario() {
      console.log(this.overview)
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
