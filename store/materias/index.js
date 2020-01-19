import debug, { error } from '~/utils/debug'

const log = debug.extend('materias')
const logError = error.extend('materias')

export const state = () => ({
  __inited: false,
  list: []
})

export const actions = {
  async init({ state }, force = false) {
    if (state.__inited && !force) return

    const res = await this.$axios.$get(`/materias`)

    if (!res.success) logError('Error on fetching materias from API', res.error)
    else {
      state.list = res.data
      log(`Initialized materias store with ${state.list.length} entries`, state.list)

      state.__inited = true
    }
  }
}
