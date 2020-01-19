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

export const actions = {}
