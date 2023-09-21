import './Login.scss'

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
  const [rememberLogin, setRememberLogin] = useState(false)
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
          return
        }
        token = await api.passwordlessLoginReceiveToken(email, loginCode)
      } else {
        token = await api.receiveAuthToken(email, password)
      }

      if (token) {
        api.setBearerAuthToken(
          token,
          rememberLogin ? localStorage : sessionStorage
        )
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
          autoFocus={true}
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
        {passwordlessLogin && showCodeInput && (
          <>
            <input
              type="text"
              inputMode="numeric"
              pattern="\d{4,}"
              maxLength={4}
              required={true}
              placeholder={t('Your login code')}
              data-tooltip-content={t(
                'If you have signed up correctly, you have now received a login code which you can place here'
              )}
              autoFocus={true}
              onChange={(ev) => setLoginCode(ev.target.value)}
            ></input>
            <div className='password-info'>
              <div>{t('We sent the login code')}</div>
              <a
                href="#"
                onClick={() => setPasswordlessLogin(false)}
              >
                {t('Click here, if you want to use your password instead')}
              </a>
            </div>
          </>
        )}
        {(password?.length >= 8 || loginCode?.length >= 4) && (
          <div className="checkbox">
            <label htmlFor="remember-login">{t('Remember login')}</label>
            <input
              type="checkbox"
              id="remember-login"
              onChange={(ev) => setRememberLogin(ev.target.checked)}
            ></input>
          </div>
        )}

        <button type="submit">Login</button>
      </fieldset>
    </form>
  )
}
