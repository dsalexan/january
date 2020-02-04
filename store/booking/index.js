import Moment from 'moment'

import _ from 'lodash'
import { extendMoment } from 'moment-range'

import debug, { error } from '~/utils/debug'

const moment = extendMoment(Moment)

const log = debug.extend('booking')
const logError = error.extend('booking')

export const state = () => ({
  __inited: false,
  list: [],
  all: [],
  emails: []
})

export const getters = {
  overview(state, getters, rootState) {
    const overlap = (timeSegments) => {
      let ret = false
      let i = 0
      while (!ret && i < timeSegments.length - 1) {
        const seg1 = timeSegments[i]
        const seg2 = timeSegments[i + 1]
        const range1 = moment.range(moment(seg1[0], 'HH:mm'), moment(seg1[1], 'HH:mm'))
        const range2 = moment.range(moment(seg2[0], 'HH:mm'), moment(seg2[1], 'HH:mm'))
        if (range1.overlaps(range2)) {
          ret = true
        }
        i++

        return ret
      }
    }

    // gives overview of not read new status
    const o = {
      pending: state.list.filter((b) => b.status === 0),
      confirmed: state.list.filter((b) => b.status === 1),
      blocking: []
    }

    if (state.list.length === 0 || rootState.materias.list.length === 0) return o

    o.blocking = o.pending.map((b) => {
      let blockedByConfirmed = []
      let blockedByPending = []

      // https://stackoverflow.com/questions/44800471/check-if-times-overlap-using-moment
      // against confirmed
      blockedByConfirmed = _.cloneDeep(o.confirmed)
        .filter((cb) => cb.weekday.some((wd) => b.weekday.includes(wd)))
        .filter((cb) =>
          overlap([
            [cb.starttime, cb.endtime],
            [b.starttime, b.endtime]
          ])
        )

      // against pending
      if (blockedByConfirmed.length === 0) {
        blockedByPending = _.cloneDeep(o.pending)
          .filter((cb) => cb.materia !== b.materia && cb.weekday.some((wd) => b.weekday.includes(wd)))
          .filter((cb) =>
            overlap([
              [cb.starttime, cb.endtime],
              [b.starttime, b.endtime]
            ])
          )
      }

      return {
        booking: {
          booking: b,
          blockedBy: [...blockedByConfirmed, ...blockedByPending]
        },
        blocked: blockedByConfirmed.length > 0 || blockedByPending.length > 0
      }
    })
    o.blocking = o.blocking.filter((b) => b.blocked).map((b) => b.booking)

    o.pending = o.pending.filter((b) => o.blocking.find((bb) => bb.booking.materia === b.materia) === undefined)

    return o
  },
  users(state) {
    const _users = {}

    state.all.map((booking) => {
      if (!(booking.student in _users)) {
        _users[booking.student] = {
          name: booking.name_student,
          student: booking.student,
          turma: booking.turma,
          bookings: [],
          emails: state.emails.find((entry) => entry.student === booking.student)
        }
      }

      _users[booking.student].bookings.push(booking)
    })

    return Object.values(_users)
  },
  unsentEmails(state, getters) {
    return getters.users.filter((u) => u.emails.length === 0)
  }
}

export const actions = {
  async allEmails({ state, rootState }, force = false) {
    if (rootState.auth.loggedIn && rootState.auth.user._id === 'admin') {
      let res
      try {
        res = await this.$axios.$get(`users/mail`)
      } catch (e) {
        res = {
          success: false,
          error: e
        }
      }

      if (!res.success) {
        logError('Error on fetching emails sent from API', '/users/mail', res.error)
      } else {
        state.emails = res.data
        log(`Initialized global emails store with ${state.list.length} entries`, state.all)
      }
    }
  },
  async userBookings({ state }, force = false) {
    const res = await this.$axios.$get(`me/booking`)

    if (!res.success) {
      logError('Error on fetching booking from API', '/me/booking', res.error)
      throw new Error('Error on fetching booking from API')
    } else {
      state.list = res.data
      log(`Initialized booking store with ${state.list.length} entries`, state.list)
    }
  },
  async allBookings({ state, rootState }, force = false) {
    if (rootState.auth.loggedIn && rootState.auth.user._id === 'admin') {
      let res
      try {
        res = await this.$axios.$get(`booking`)
      } catch (e) {
        res = {
          success: false,
          error: e
        }
      }

      if (!res.success) {
        logError('Error on fetching bookings from API', '/booking', res.error)
      } else {
        state.all = res.data
        log(`Initialized global booking store with ${state.list.length} entries`, state.all)
      }
    }
  },
  async init({ state, dispatch }, force = false) {
    if (state.__inited && !force) return

    await Promise.all([dispatch('userBookings', force), dispatch('allBookings', force), dispatch('allEmails', force)])

    state.__inited = true
  },
  async select({ state, dispatch }, id) {
    if (state.list.includes(id)) return

    const res = await this.$axios.$post('me/booking', {
      materia: id,
      status: 0
    })

    if (!res.success) return logError('Could not add to booking in API', res.error)

    // TODO: Add pushers to update smoothly
    await dispatch('init', true)
    // state.list.splice(state.list.length, 0, res.data)
  },
  async confirm({ state, getters, dispatch }, id = null) {
    const _ids = id === null ? getters.overview.pending.map((booking) => booking.materia) : [id]

    for (const _id of _ids) {
      if (!state.list.find((booking) => booking.materia === _id)) continue

      const res = await this.$axios.$post('me/booking', {
        materia: _id,
        status: 1
      })

      if (!res.success) return logError(`Could not confirm booking <${_id}> in API`, res.error)
      else {
        // TODO: Add pushers to update smoothly
        await dispatch('init', true)
        // state.list.find((booking) => booking.materia === _id).status = 1
      }
    }
  },
  async deselect({ state, dispatch }, id) {
    const index = state.list.findIndex((booking) => booking.materia === id)

    if (index === undefined) return

    const res = await this.$axios.$delete(`me/booking/${id}`)

    if (!res.success) return logError('Could not add to booking in API', res.error)

    // TODO: Add pushers to update smoothly
    await dispatch('init', true)
    // state.list.splice(index, 1)
  }
}
