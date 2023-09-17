import { useState } from 'react'
import { currentUserState } from '../states/currentUserState'
import { useRecoilState } from 'recoil'
import * as api from '../../lib/api'
import {t} from '../../lib/helper'
import { useNavigate } from 'react-router-dom'

export function Login() {
  const [email, setEmail] = useState(null)
  const [password, setPassword] = useState(null)
  const [, setUser] = useRecoilState(currentUserState)
  const navigate = useNavigate();

  async function handleFormSubmit(ev) {
    ev.preventDefault()
    try {
      let token = await api.receiveAuthToken(email, password)
      if (token) {
        localStorage.setItem('authToken', token)
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
              ? t('Could not login') + ': ' + t(e.response.data.message)
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
          placeholder="Email"
          onChange={(ev) => setEmail(ev.target.value)}
          autoComplete="username"
        ></input>
        <input
          type="password"
          required={true}
          placeholder="Password"
          autoComplete="current-password"
          onChange={(ev) => setPassword(ev.target.value)}
        ></input>
        <button type="submit">Login</button>
      </fieldset>
    </form>
  )
}
