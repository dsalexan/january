import _, { isNil, get, find } from 'lodash'
import debug, { error } from '~/utils/debug'

const log = debug.extend('materias')
const logError = error.extend('materias')

export const strict = false

export const state = () => ({
  student: null
})

export const getters = {
  studentName: (state) => {
    return get(find(get(state.auth.user, 'students', []), ['_id', state.student]), 'name', null)
  }
}

export const mutations = {
  setStudent(state, index) {
    if (isNil(index)) return (state.student = null)
    state.student = index
  }
}

export const actions = {
  async mail({ state, dispatch }, { users = [] } = {}) {
    const _users = _.isArray(users) ? users : [users]

    const res = await this.$axios.$post(`users/mail`, {
      users: _users
    })

    if (!res.success) {
      logError('Error on sending mail', '/users/mail', res.error)
      throw new Error('Error on sending mail')
    } else {
      log(`Mail sent to users`, _users)

      await dispatch('booking/init', true, { root: true })
    }
  },
  async finish({ state, dispatch }, { value = true } = {}) {
    const res = await this.$axios.$put(state.student + `/finished`, {
      value
    })

    if (!res.success) {
      logError('Error on finishing', '/' + state.student + '/finished', res.error)
      throw new Error('Error on finishing')
    } else {
      log(`Finished bookings`, res)

      this.$auth.fetchUser()
    }
  }
}
