import { atom } from 'jotai'
export const currentUserState = atom({
  email: null,
  two_factor_confirmed_at: null,
})
