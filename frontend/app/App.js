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
    async function fetchUser() {
      if (!user) {
        let token = await api.getAuthToken()
        if (token) {
          api.setBearerAuthToken(token)
          let user = await api.user()
          setUser(user.email)
          console.debug(`Logged in as ${user.email}`)
          return
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
                    <Link to="/signup">Signup here</Link> |{' '}
                    <Link to="/login">Login</Link>
                  </p>
                </div>
              ) : (
                <Navigate to="/home" />
              )
            }
          />
          <Route path="/signup" element={<Signup></Signup>} />
          <Route path="/login" element={<Login></Login>} />
          {user && (
            <>
              <Route path="/home" element={<Home></Home>} />
              <Route path="/logout" element={<Logout></Logout>} />
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
