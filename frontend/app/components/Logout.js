import { useEffect } from 'react'
import { useRecoilState } from 'recoil'
import { currentUserState } from '../states/currentUserState'

export function Logout() {
  const [, setUser] = useRecoilState(currentUserState)
  useEffect(() => {
    async function logoutAndRedirectToRootUrl() {
      async function logoutAndClearSession() {
        try {
          await api.logout()
        } catch (e) {
          console.error(e)
        }
        localStorage.removeItem('authToken')
      }

      await logoutAndClearSession()
      setUser(null)
      window.location.href = '/'
    }
    logoutAndRedirectToRootUrl()
  })

  return <></>
}
