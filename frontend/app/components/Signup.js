import { useEffect, useState } from 'react'
import * as api from '../../lib/api'
import { t } from '../../lib/helper'
import { useNavigate } from 'react-router-dom'

export function Signup() {
  const [errors, setErrors] = useState([])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const navigate = useNavigate()

  const minPasswordLength = 8

  useEffect(() => {
    validateForm()
  }, [password, passwordConfirm])

  useEffect(() => {
    if (!email) return
    async function checkEmailIsAvailable(email) {
      let isAvailable = await api.emailIsAvailableForSignup(email)
      if (!isAvailable) {
        setErrors([t('E-mail has already been signed up')])
      }
    }
    if (/^[^@]+@[^@]+?\.[a-zA-Z]{2,}$/.test(email)) {
      checkEmailIsAvailable(email)
    }
  }, [email])

  function validateForm() {
    if (
      password &&
      password.length >= minPasswordLength &&
      passwordConfirm.length > 0 &&
      password !== passwordConfirm
    ) {
      setErrors([t('Passwords do not match')])
      return false
    }
    if (!email || !password) {
      setErrors([t('Please fill out all required fields')])
      return false
    }
    setErrors([])
    return true
  }

  function handleFormChange() {
    if (!validateForm()) {
      return
    }
  }

  function handleFormSubmit(ev) {
    ev.preventDefault()
    // the timeouts ensures to start the request after the basic useEffect validations
    setTimeout(async () => {
      if (errors.length > 0) {
        return
      }
      try {
        let signupResult = await api.signup({
          email,
          password,
        })
        if (signupResult.message) {
          alert(t(signupResult.message))
          navigate('/login?afterSignup=true')
        }
      } catch (err) {
        alert(t('Could not login') + ': ' + err.message);
        console.error(err);
      }
      
    }, 100)
  }

  return (
    <form onChange={handleFormChange} onSubmit={handleFormSubmit}>
      <fieldset>
        <input
          type="email"
          id="email"
          required={true}
          placeholder={t('E-Mail')}
          onChange={(ev) => setEmail(ev.target.value)}
        ></input>
        <input
          type="password"
          id="password"
          required={true}
          placeholder={t('Password')}
          minLength={minPasswordLength}
          autoComplete="true"
          onChange={(ev) => setPassword(ev.target.value)}
        ></input>
        <input
          type="password"
          id="password-confirm"
          required={true}
          placeholder={t('Confirm password')}
          autoComplete="true"
          onChange={(ev) => setPasswordConfirm(ev.target.value)}
        ></input>

        <button type="submit" disabled={errors.length > 0}>
          Signup
        </button>
        <div style={{ minHeight: '4rem' }}>
          {errors.length > 0 && <p>{errors}</p>}
        </div>
      </fieldset>
    </form>
  )
}
