import { useEffect } from 'react'
import { useAtom } from 'jotai'
import { currentUserState } from '../states/currentUserState'
import { useNavigate } from 'react-router-dom'
import * as api from '../../lib/api'

export function Logout() {
  const [, setUser] = useAtom(currentUserState)
  const navigate = useNavigate();
  useEffect(() => {
    async function logoutAndRedirectToRootUrl() {
      async function logoutAndClearSession() {
        window.localStorage.clear()
        window.sessionStorage.clear()
        try {
          await api.logout()
        } catch (e) {
          console.error(e)
        }
      }

      await logoutAndClearSession()
      console.debug('Session cleared')
      setUser({})
      navigate('/')
    }
    logoutAndRedirectToRootUrl()
  })

  return <></>
}
