import './Login.scss'

import { useState } from 'react'
import { currentUserState } from '../states/currentUserState'
import { useAtom } from 'jotai'
import * as api from '../../lib/api'
import { t } from '../../lib/helper'
import { useNavigate } from 'react-router-dom'

export function Login() {
  const [email, setEmail] = useState(null)
  const [password, setPassword] = useState(null)
  const [loginCode, setLoginCode] = useState(null)
  const [passwordlessLogin, setPasswordlessLogin] = useState(false)
  const [rememberLogin, setRememberLogin] = useState(true)
  const [showCodeInput, setShowCodeInput] = useState(false)
  const [showTwoFactorOTPInput, setShowTwoFactorOTPInput] = useState(false)
  const [twoFactorOTP, setTwoFactorOTP] = useState(null)
  const [, setUser] = useAtom(currentUserState)
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
        token = await api.receiveAuthToken(email, password, {
          otp: twoFactorOTP,
        })
        if (token['2fa_otp_required_for_login']) {
          alert(
            token['2fa_login_message'] ||
              t('2fa enabled. Please use the code from your authenticator app')
          )
          setShowTwoFactorOTPInput(true)
          return
        }
      }

      if (token) {
        api.setBearerAuthToken(
          token,
          rememberLogin ? localStorage : sessionStorage
        )
        const user = await api.user()
        setUser({
          email: user.email,
          two_factor_confirmed_at: user.two_factor_confirmed_at,
        })
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
      } else {
        alert(`${t('Could not login')}: ${e.message}`)
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
        {showTwoFactorOTPInput && (
          <>
            <input
              type="password"
              maxLength={6}
              inputMode="numeric"
              required={true}
              placeholder={t('Your 2FA OTP code')}
              autoComplete="one-time-code"
              onChange={(ev) => setTwoFactorOTP(ev.target.value)}
            ></input>
          </>
        )}
        {!showTwoFactorOTPInput && !passwordlessLogin && (
          <>
            <input
              type="password"
              required={true}
              placeholder={t('Password')}
              autoComplete="current-password"
              onChange={(ev) => setPassword(ev.target.value)}
            ></input>
            <div className="password-info">
              <a
                href="#"
                style={{ color: 'currentColor' }}
                onClick={(ev) => {
                  ev.preventDefault()
                  setPasswordlessLogin(true)
                }}
              >
                {t('Do you want to login without password?')}
              </a>
            </div>
          </>
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
            <div className="password-info">
              <div>
                <b>{t('Login code sent, please check your e-mail')}.</b>
              </div>
              <div className="a" onClick={() => setPasswordlessLogin(false)}>
                {t('Click here, if you want to use your password instead')}
              </div>
            </div>
          </>
        )}
        <div className="checkbox">
          <label htmlFor="remember-login">{t('Remember log in')}</label>
          <input
            type="checkbox"
            id="remember-login"
            defaultChecked={rememberLogin}
            onChange={(ev) => setRememberLogin(ev.target.checked)}
          ></input>
        </div>

        <button type="submit">
          {passwordlessLogin && !showCodeInput
            ? t('Send login code via E-Mail')
            : t('Log in')}
        </button>
      </fieldset>
    </form>
  )
}
