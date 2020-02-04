import _ from 'lodash'
import debug, { error } from '~/utils/debug'

const log = debug.extend('materias')
const logError = error.extend('materias')

export const strict = false

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
  }
}
