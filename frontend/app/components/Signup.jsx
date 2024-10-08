import { useEffect, useState } from 'react'
import * as api from '../../lib/api'
import { t } from '../../lib/helper'
import { useNavigate } from 'react-router-dom'

export function Signup() {
  const [errors, setErrors] = useState({})
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const navigate = useNavigate()

  const minPasswordLength = 8

  useEffect(() => {
    if (!email) return
    async function checkEmailIsAvailable(email) {
      let isAvailable = await api.emailIsAvailableForSignup(email)
      if (!isAvailable) {
        setErrors({
          ...errors,
          ...{ email: t('E-mail has already been signed up') },
        })
      }
    }

    setErrors({ ...errors, ...{ email: null } })

    if (/^[^@]+@[^@]+?\.[a-zA-Z]{2,}$/.test(email)) {
      checkEmailIsAvailable(email)
    }
  }, [email])

  useEffect(() => {
    if (!password) return

    if (password && passwordConfirm) {
      if (passwordConfirm === password && password.length < 8) {
        setErrors({
          ...errors,
          ...{
            password: t('Your password must have at least $chars characters', {
              chars: minPasswordLength,
            }),
          },
        })
      } else if (
        passwordConfirm.length >= minPasswordLength - 1 &&
        passwordConfirm !== password
      ) {
        setErrors({
          ...errors,
          ...{ password: t('Passwords do not match') },
        })
      } else {
        setErrors({ ...errors, ...{ password: null } })
      }
    }
  }, [password, passwordConfirm])

  function handleFormSubmit(ev) {
    ev.preventDefault()
    // the timeouts ensures to start the request after the basic useEffect validations
    setTimeout(async () => {
      if (
        Object.keys(errors)
          .map((k) => errors[k])
          .filter((e) => !!e).length > 0
      ) {
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
        let message = err.response?.data?.message || err.message
        alert(`${t('Could not sign up')}: ${message}`)
        console.error(err)
      }
    }, 100)
  }

  return (
    <form onSubmit={handleFormSubmit}>
      <fieldset>
        <input
          type="email"
          id="email"
          required={true}
          placeholder={t('E-Mail')}
          autoFocus={true}
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
          {t('Sign up')}
        </button>
        <div style={{ minHeight: '4rem' }}>
          {errors &&
            Object.keys(errors).map((k) =>
              errors[k] ? <p key={`error-${k}`}>{errors[k]}</p> : null
            )}
        </div>
      </fieldset>
    </form>
  )
}
