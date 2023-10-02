import './App.scss'

import { BrowserRouter, Link, Route, Routes, Navigate } from 'react-router-dom'

import * as api from '../lib/api'

import { currentUserState } from './states/currentUserState'

import '../i18n/i18n'
import { t } from '../lib/helper'

import { useRecoilState, useRecoilValue } from 'recoil'
import { useEffect } from 'react'
import { Signup } from './components/Signup'
import { Login } from './components/Login'
import { Home } from './components/Home'
import { Logout } from './components/Logout'

export function App() {
  const [user, setUser] = useRecoilState(currentUserState)

  useEffect(() => {
    async function loginUser(token) {
      let localStorage = window.localStorage
      api.setBearerAuthToken(token, localStorage)
      let user = null
      try {
        user = await api.user()
      } catch (e) {
        console.log(localStorage.getItem('authToken'))
        if (e.response?.status === 401 && localStorage.getItem('authToken')) {
          console.debug(
            `Session invalid. Clearing authtoken from local storage now and send visitor to login`
          )
          localStorage.removeItem('authToken')
          if (window.location.pathname !== '/login') {
            window.location.href = '/login'
          }
          return
        } else {
          throw e
        }
      }
      setUser(user.email)
      console.debug(`Logged in as ${user.email}`)
    }

    async function fetchUser() {
      if (!user) {
        let token = new URLSearchParams(window.location.search).get('authToken')

        // we have a authToken from a signup session
        if (token && /laravel_sanctum/.test(token)) {
          loginUser(token)
          return
        }

        token = await api.getAuthToken()

        if (token) {
          loginUser(token)
          return
        } else {
        }
        console.debug('User is not logged in')
      }
    }
    fetchUser()
  }, [user])

  return (
    <div id="app">
      <BrowserRouter>
        <Link to="/">
          <div className="logo"></div>
        </Link>

        <Routes>
          <Route path="/about" element={<Navigate to="/signup" />} />
          <Route
            path="/"
            element={
              !user ? (
                <div style={{ textAlign: 'center' }}>
                  <h1>{t('React is running')}</h1>
                  <p>
                    <Link to="/signup">Signup</Link> •{' '}
                    <Link to="/login">Login</Link>
                  </p>
                </div>
              ) : (
                <Navigate to="/home" />
              )
            }
          />
          {user ? (
            <>
              <Route path="/home" element={<Home></Home>} />
              <Route path="/logout" element={<Logout></Logout>} />
            </>
          ) : (
            <>
              <Route path="/signup" element={<Signup></Signup>} />
              <Route path="/login" element={<Login></Login>} />
            </>
          )}
          <Route
            path="*"
            element={
              <div style={{ textAlign: 'center' }}>
                This route does not exists :(
              </div>
            }
          ></Route>
        </Routes>
      </BrowserRouter>
    </div>
  )
}
