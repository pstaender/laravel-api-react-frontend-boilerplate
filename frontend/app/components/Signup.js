import { useEffect, useState } from 'react'
import * as api from '../../lib/api'

export function Signup() {
  const [errors, setErrors] = useState([])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')

  const minPasswordLength = 8

  useEffect(() => {
    validateForm()
  }, [password, passwordConfirm])

  useEffect(() => {
    if (!email) return;
    async function checkEmailIsAvailable(email) {
        let isAvailable = await api.emailIsAvailableForSignup(email);
        if (!isAvailable) {
            setErrors(['E-Mail has already been signed up'])
        }
    }
    if (/^[^@]+@[^@]+?\.[a-zA-Z]{2,}$/.test(email)) {
        checkEmailIsAvailable(email);
    }
  }, [email])

  function validateForm() {
    if (
      password &&
      password.length >= minPasswordLength &&
      passwordConfirm.length > 0 &&
      password !== passwordConfirm
    ) {
      setErrors(['Passwords do not match'])
      return false
    }
    if (!email || !password) {
      setErrors(['Please fill out all required fields'])
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
    ev.preventDefault();
    setTimeout(async () => {
        if (errors.length > 0) {
            return;
        }
        await api.signup({
            email,
            password
        })
    }, 100);
  }

  return (
    <form onChange={handleFormChange} onSubmit={handleFormSubmit}>
      <fieldset>
        <input
          type="email"
          id="email"
          required={true}
          placeholder="E-Mail"
          onChange={(ev) => setEmail(ev.target.value)}
        ></input>
        <input
          type="password"
          id="password"
          required={true}
          placeholder="Password"
          minLength={minPasswordLength}
          autoComplete="true"
          onChange={(ev) => setPassword(ev.target.value)}
        ></input>
        <input
          type="password"
          id="password-confirm"
          required={true}
          placeholder="Cofirm password"
          autoComplete="true"
          onChange={(ev) => setPasswordConfirm(ev.target.value)}
        ></input>

        <button type="submit" disabled={errors.length > 0}>
          Signup
        </button>
        <div style={{ minHeight: '2rem' }}>
          {errors.length > 0 && <p>{errors}</p>}
        </div>
      </fieldset>
    </form>
  )
}
