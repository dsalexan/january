import debug, { error } from '~/utils/debug'

const log = debug.extend('booking')
const logError = error.extend('booking')

export const state = () => ({
  __inited: false,
  list: []
})

export const getters = {
  overview(state, getters, rootState) {
    // gives overview of not read new status
    const o = {
      pending: state.list.filter((b) => b.status === 0),
      confirmed: state.list.filter((b) => b.status === 1)
    }

    if (state.list.length === 0 || rootState.materias.list.length === 0) return o

    o.blocking = o.pending.filter((b) => {
      // TODO: Add moment range and check if time overlaps, if it does, then is a blocking booking and can not be confirmed
      // https://stackoverflow.com/questions/44800471/check-if-times-overlap-using-moment
      // against confirmed
      const c = o.confirmed
        .filter((cb) => cb.weekday.some((wd) => b.weekday.includes(wd)))
        .map((cb) => ({
          start: cb.starttime,
          end: cb.endtime
        }))

      if (c.length > 0) debugger

      // against pending
      const p = o.pending
        .filter((cb) => cb.materia !== b.materia && cb.weekday.some((wd) => b.weekday.includes(wd)))
        .map((cb) => ({
          start: cb.starttime,
          end: cb.endtime
        }))

      if (p.length > 0) debugger

      return true
    })

    return o
  }
}

export const actions = {
  async init({ state }, force = false) {
    if (state.__inited && !force) return

    const res = await this.$axios.$get(`me/booking`)

    if (!res.success) logError('Error on fetching booking from API', res.error)
    else {
      state.list = res.data
      log(`Initialized booking store with ${state.list.length} entries`, state.list)

      state.__inited = true
    }
  },
  async select({ state }, id) {
    if (state.list.includes(id)) return

    const res = await this.$axios.$post('me/booking', {
      materia: id,
      status: 0
    })

    if (!res.success) return logError('Could not add to booking in API', res.error)

    state.list.splice(state.list.length, 0, res.data)
  },
  async confirm({ state, getters }, id = null) {
    const _ids = id === null ? getters.overview.pending.map((booking) => booking.materia) : [id]

    for (const _id of _ids) {
      if (!state.list.find((booking) => booking.materia === _id)) continue

      const res = await this.$axios.$post('me/booking', {
        materia: _id,
        status: 1
      })

      if (!res.success) return logError(`Could not confirm booking <${_id}> in API`, res.error)
      else {
        state.list.find((booking) => booking.materia === _id).status = 1
      }
    }
  },
  async deselect({ state }, id) {
    const index = state.list.findIndex((booking) => booking.materia === id)

    if (index === undefined) return

    const res = await this.$axios.$delete(`me/booking/${id}`)

    if (!res.success) return logError('Could not add to booking in API', res.error)

    state.list.splice(index, 1)
  }
}
