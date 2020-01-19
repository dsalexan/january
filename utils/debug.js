import debug from 'debug'

export default debug('january')

export const error = debug('january')
// eslint-disable-next-line no-console
error.log = console.error.bind(console)
