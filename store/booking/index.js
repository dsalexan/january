export const state = () => ({
  list: []
})

export const getters = {
  overview(state) {
    // gives overview of not read new status
    return {
      quantity: state.list.length,
      state: 'confirmed'
    }
  }
}

export const actions = {
  select({ state }, id) {
    if (state.list.includes(id)) return
    state.list.push(id)
  },
  deselect({ state }, id) {
    const index = state.list.findIndex((i) => i === id)
    state.list.splice(index, 1)
  }
}
