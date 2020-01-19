<template>
  <v-layout class="page-index pa-10" column justify-center align-center>
    <v-flex class="d-flex flex-column justify-center align-center" style="width: 100%;">
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
              </v-card-title>
              <v-data-table
                :headers="headers"
                :items="searchableMaterias"
                :items-per-page="itemsPerPage"
                :search="search"
                @update:items-per-page="updateItemsPerPage"
                :value="mappedSelectedItems"
              >
                <template v-slot:item.action="{ item }">
                  <!-- {{ item }} -->

                  <v-tooltip v-if="!selected.includes(item._id)" left>
                    <template v-slot:activator="{ on }">
                      <v-btn v-on="on" @click="selectItem(item)" icon>
                        <v-icon>mdi-checkbox-blank-circle-outline</v-icon>
                      </v-btn>
                    </template>
                    <span>Selecionar</span>
                  </v-tooltip>

                  <v-tooltip v-else left>
                    <template v-slot:activator="{ on }">
                      <v-btn v-on="on" @click="deselectItem(item)" icon>
                        <v-icon color="green">mdi-check-bold</v-icon>
                      </v-btn>
                    </template>
                    <span>Selecionado</span>
                  </v-tooltip>
                </template>

                <template v-slot:item._dStartTime="{ item }">
                  <div v-for="(time, j) in item._dStartTime" :key="j">
                    {{ time }}
                  </div>
                </template>
                <template v-slot:item._dEndTime="{ item }">
                  <div v-for="(time, j) in item._dEndTime" :key="j">
                    {{ time }}
                  </div>
                </template>
                <template v-slot:item._dTurmas="{ item }">
                  <v-chip v-for="(turma, j) in item._dTurmas" :key="j" class="ma-2" small>
                    {{ turma }}
                  </v-chip>
                </template>
              </v-data-table>
            </v-card>
          </v-tab-item>
        </v-tabs>
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
      tab: undefined,
      search: undefined,
      itemsPerPage: getData('itemsPerPage') || 5,
      headers: [
        {
          text: 'Atividade',
          align: 'left',
          value: 'name'
        },
        { text: 'Dia', value: '_dWeekday' },
        { text: 'Início', value: '_dStartTime' },
        { text: 'Fim', value: '_dEndTime' },
        { text: 'Turmas', value: '_dTurmas' },
        { text: 'Ações', value: 'action', sortable: false }
      ]
    }
  },
  computed: {
    ...mapState('booking', {
      selected: 'list'
    }),
    ...mapState('materias', {
      materias: 'list'
    }),
    cores() {
      return [
        {
          name: 'Núcleo Planck de Artes'
        },
        {
          name: 'Núcleo Planck de Esportes'
        },
        {
          name: 'Núcleo Planck de Tecnologia'
        },
        {
          name: 'Planck Internacional'
        },
        {
          name: 'Programa Planck de Preparação Olímpica'
        }
      ]
    },
    mappedSelectedItems() {
      return this.selected.map((id) => this.materias.find((m) => m._id === id))
    },
    searchableMaterias() {
      return _.cloneDeep(this.materias).map((m) => {
        m._dWeekday = m.weekday.toString().toWeekday()
        m._dStartTime = m.starttime.map((time) => this.$moment('2019-01-19 ' + time).format('HH:mm'))
        m._dEndTime = m.endtime.map((time) => this.$moment('2019-01-19 ' + time).format('HH:mm'))
        m._dTurmas = m.turmas.map((turma) => LIST_TURMAS[turma])

        return m
      })
    }
  },
  methods: {
    ...mapActions('booking', ['select', 'deselect']),
    updateItemsPerPage(newVal) {
      this.itemsPerPage = newVal
      setData('itemsPerPage', this.itemsPerPage)
    },
    selectItem(item) {
      this.select(item._id)
    },
    deselectItem(item) {
      this.deselect(item._id)
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
