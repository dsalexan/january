<template>
  <v-layout class="page-reservas" column justify-center align-center>
    <v-flex class="d-flex flex-column justify-center align-center" style="width: 100%">
      <h2 class="display-2 has-text-centered mb-1 font-weight-bold">Reservas</h2>
      <!-- <div class="has-text-centered mb-12">Atualize as informações do seu perfil ou modifique sua senha.</div> -->
      <div class="d-flex flex-row justify-space-around align-center pt-4" style="width: 90%; flex-grow: 1;">
        <v-tabs v-model="tab" :color="tab ? 'green' : ''" centered class="d-flex flex-column" style="height: 100%;">
          <v-tab>Reservas Confirmadas</v-tab>

          <v-tab-item v-for="(tabItem, index) in tabItems" :key="index">
            <v-card class="elevation-0">
              <v-card-title v-if="tabItem.status === 'pending'">
                <!-- <v-tooltip bottom>
                  <template v-slot:activator="{ on }">
                    <v-btn
                      v-on="on"
                      @click="confirmBookings"
                      :disabled="overview.pending.length === 0"
                      tile
                      depressed
                      color="green lighten-5 green--text"
                    >
                      Enviar Emails ({{ overview.pending.length }})
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
                </v-tooltip> -->
              </v-card-title>
              <v-data-table
                :headers="tabItem.headers"
                :items="tabItem.items"
                :items-per-page="itemsPerPage"
                @update:items-per-page="updateItemsPerPage"
              >
                <template v-slot:item="{ item }">
                  <tr
                    :class="{ 'blue lighten-5': item._dStatus === 'pending', 'green lighten-5': item._dStatus === 'confirmed' }"
                  >
                    <td class="text-left">{{ item.name_student }}</td>
                    <td class="text-start py-4">
                      {{ item.core }}
                    </td>
                    <td class="text-start">
                      {{ item.name_materia }}
                    </td>
                    <td class="text-start">
                      <div v-html="item._dPosition"></div>
                    </td>
                    <td class="text-start">
                      {{ item._dSubscriptionTime }}
                      <div class="grey--text caption">
                        {{ item._dSubscriptionTimeCalendar }}
                      </div>
                    </td>
                    <td class="text-start">
                      <v-tooltip bottom>
                        <template v-slot:activator="{ on }">
                          <v-btn v-on="on" @click="sendEmail(item)" icon>
                            <v-icon color="blue">mdi-email-send-outline</v-icon>
                          </v-btn>
                        </template>
                        <span>Enviar Email</span>
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
          text: 'Estudante',
          align: 'left',
          value: 'student'
        },
        { text: 'Núcleo', value: 'core' },
        { text: 'Atividade', value: 'activity' },
        { text: 'Posição da Fila', value: '_dPosition' },
        { text: 'Horário Inscrição', value: '_dSubscriptionTime' },
        { text: 'Ações', value: 'actions' }
      ]
    }
  },
  computed: {
    ...mapState('booking', {
      bookings: 'all'
    }),
    ...mapGetters('booking', ['overview']),
    ...mapState('materias', {
      materias: 'list'
    }),
    mappedSelectedItems() {
      return this.selected.map((booking) => this.materias.find((m) => m._id === booking.materia))
    },
    mappedBookings() {
      return _.cloneDeep(this.bookings).map((m) => {
        m._dPosition = `<b class="${m.position > m.maximum ? 'red' : 'green'}--text mr-1">${m.position}</b> de ${m.maximum}</div>`
        m._dSubscriptionTime = this.$moment
          .utc(m.timestamp)
          .tz('America/Sao_Paulo')
          .format('LT')
        m._dSubscriptionTimeCalendar = this.$moment
          .utc(m.timestamp)
          .tz('America/Sao_Paulo')
          .fromNow()

        return m
      })
    },
    tabItems() {
      return [
        {
          status: 'confirmed',
          items: this.mappedBookings,
          headers: this.headers
        }
      ]
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
    },
    sendEmail() {
      console.log('SEND EMAIL')
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
