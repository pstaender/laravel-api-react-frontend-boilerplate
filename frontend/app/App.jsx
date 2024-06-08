import './App.scss'

import { Link, Route, Routes, Navigate, HashRouter, useLocation, redirect } from 'react-router-dom'
import { useAtom } from 'jotai'
import * as api from '../lib/api'

import { currentUserState } from './states/currentUserState'

import '../i18n/i18n'
import { t } from '../lib/helper'
import { useEffect } from 'react'
import { Signup } from './components/Signup'
import { Login } from './components/Login'
import { Home } from './components/Home'
import { Logout } from './components/Logout'

export function App() {
  const [user, setUser] = useAtom(currentUserState)
  const location = useLocation();

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
          if (location.pathname !== '/login') {
            redirect('/login')
          }
          return
        } else {
          throw e
        }
      }
      setUser({ email: user.email })
      console.debug(`Logged in as ${user.email}`)
    }

    async function fetchUser() {
      if (!user?.email) {
        let token = new URLSearchParams(window.location.search).get('authToken')

        /**
         * we have received an authToken from a signup session
         */ 
        if (token && /laravel_sanctum/.test(token)) {
          loginUser(token)
          return
        }

        token = await api.getAuthToken()

        if (token) {
          loginUser(token)
          return
        }
        console.debug('User is not logged in')
        /**
         * If needed, you can redirect the user to the login page here
         */
      }
    }
    fetchUser()
  }, [user])

  return (
    <div id="app">
        <Link to="/">
          <div className="logo"></div>
        </Link>

        <Routes>
          <Route path="/about" element={<Navigate to="/signup" />} />
          <Route
            path="/"
            element={
              !user?.email ? (
                <div style={{ textAlign: 'center' }}>
                  <h1>{t('React is running')}</h1><br></br>
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
          {user?.email ? (
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
                Route not found | 404
              </div>
            }
          ></Route>
        </Routes>
    </div>
  )
}
