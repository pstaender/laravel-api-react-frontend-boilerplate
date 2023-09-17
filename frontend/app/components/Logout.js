import { useEffect } from 'react'
import { useRecoilState } from 'recoil'
import { currentUserState } from '../states/currentUserState'
import { useNavigate } from 'react-router-dom'
import * as api from '../../lib/api'

export function Logout() {
  const [, setUser] = useRecoilState(currentUserState)
  const navigate = useNavigate();
  useEffect(() => {
    async function logoutAndRedirectToRootUrl() {
      async function logoutAndClearSession() {
        try {
          await api.logout()
        } catch (e) {
          console.error(e)
        }
        localStorage.clear()
      }

      await logoutAndClearSession()
      setUser(null)
      navigate('/')
    }
    logoutAndRedirectToRootUrl()
  })

  return <></>
}
