import debug from '../../utils/debug'

const log = debug.extend('services:user')

export function signin() {
  log('Sign In')
}

export function signout() {
  log('Sign Out')
}

export function register({ email, password }) {
  log('Register')
}

export default {
  signin,
  signout,
  register
}
