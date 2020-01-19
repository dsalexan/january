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
            <v-data-table
              :headers="headers"
              :items="materias"
              :items-per-page="itemsPerPage"
              @update:items-per-page="updateItemsPerPage"
              :value="mappedSelectedItems"
            >
              <template v-slot:item.action="{ item }">
                <!-- {{ item }} -->
                <v-btn v-if="!selected.includes(item._id)" @click="selectItem(item)" icon>
                  <v-icon>mdi-checkbox-blank-circle-outline</v-icon>
                </v-btn>
                <v-btn v-else @click="deselectItem(item)" icon>
                  <v-icon color="green">mdi-check-bold</v-icon>
                </v-btn>
              </template>
            </v-data-table>
          </v-tab-item>
        </v-tabs>
      </div>
    </v-flex>
  </v-layout>
</template>

<script>
import { getData, setData } from 'nuxt-storage/local-storage'
import { mapState, mapGetters, mapActions } from 'vuex'

export default {
  middleware: 'auth',
  data() {
    return {
      tab: undefined,
      itemsPerPage: getData('itemsPerPage') || 5,
      headers: [
        {
          text: 'Atividade',
          align: 'left',
          value: 'name'
        },
        { text: 'Dia', value: 'weekday' },
        { text: 'Início', value: 'starttime' },
        { text: 'Fim', value: 'endtime' },
        { text: 'Turma', value: 'turmas' },
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
        &, .v-window-item, .v-data-table
          height: 100%

        .v-data-table
          display: flex
          flex-direction: column

          .v-data-table__wrapper
            flex-grow: 1

          .v-data-table__selected
            background: #E8F5E9
</style>
