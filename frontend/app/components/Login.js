import { useState } from 'react'
import { currentUserState } from '../states/currentUserState'
import { useRecoilState } from 'recoil'
import * as api from '../../lib/api'
import { t } from '../../lib/helper'
import { useNavigate } from 'react-router-dom'

export function Login() {
  const [email, setEmail] = useState(null)
  const [password, setPassword] = useState(null)
  const [loginCode, setLoginCode] = useState(null)
  const [passwordlessLogin, setPasswordlessLogin] = useState(true)
  const [showCodeInput, setShowCodeInput] = useState(false)
  const [, setUser] = useRecoilState(currentUserState)
  const navigate = useNavigate()

  async function handleFormSubmit(ev) {
    ev.preventDefault()
    try {
      let token = null
      if (passwordlessLogin) {
        if (!loginCode) {
          let res = await api.passwordlessLogin(email)
          console.info(res.message)
          setShowCodeInput(true)
          return;
        }
        token = await api.passwordlessLoginReceiveToken(email, loginCode)
        console.log({token})
        
      } else {
        token = await api.receiveAuthToken(email, password)
      }

      if (token) {
        api.setBearerAuthToken(token)
        const user = await api.user()
        setUser(user.email)
        navigate('/home')
      }
    } catch (e) {
      if (e.response && e.response.data && e.response.data.message) {
        if (e.response.status === 422) {
          alert(
            e.response.data.message
              ? `${t('Could not login')}: ${e.response.data.message}`
              : t('Could not login. Wrong Password?')
          )
        }
        console.debug(e.response.data.message)
      }
      console.error(e.message)
    }
  }

  return (
    <form onSubmit={handleFormSubmit}>
      <fieldset>
        <input
          type="email"
          required={true}
          placeholder={t('E-Mail')}
          onChange={(ev) => setEmail(ev.target.value)}
          autoComplete="username"
        ></input>
        {!passwordlessLogin && (
          <input
            type="password"
            required={true}
            placeholder={t('Password')}
            autoComplete="current-password"
            onChange={(ev) => setPassword(ev.target.value)}
          ></input>
        )}
        {showCodeInput && (
          <input
          type="text"
          maxLength={6}
          required={true}
          placeholder={t('Your login code')}
          autoFocus={true}
          onChange={(ev) => setLoginCode(ev.target.value)}
        ></input>
        )}

        <button type="submit">Login</button>
      </fieldset>
    </form>
  )
}
