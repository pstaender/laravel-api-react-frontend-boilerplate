import axios from 'axios'

axios.defaults.baseURL = window?.location?.host?.startsWith('localhost')
  ? 'http://localhost:8000'
  : 'https://api.yourserver.local'

let auth_token = localStorage.getItem('authToken') || null

export function setBearerAuthToken(authToken, storage = null) {
  auth_token = authToken
  axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`
  if (storage) {
    storage.setItem('authToken', authToken)
  }
}

export function getAuthToken() {
  return auth_token
}

export async function logout() {
  localStorage.removeItem('authToken')
  sessionStorage.removeItem('authToken')
  return await axios.post('/api/v1/logout')
}

export async function user() {
  return (await axios.get('/api/v1/user')).data
}

function userAgentDevice() {
  return navigator.userAgent.replace(/\s.+$/, '')
}

export async function receiveAuthToken(
  email,
  password,
  { deviceName, otp } = {}
) {
  if (!deviceName) {
    deviceName = userAgentDevice()
  }
  await axios.get('/sanctum/csrf-cookie')
  // this request above did just set cookie in application cookie, otherwise we'll get a CSRF mismatch error
  return (
    await axios.post('/sanctum/token', {
      email,
      password,
      device_name: deviceName,
      otp,
    })
  ).data
}

export async function passwordlessLogin(email) {
  // await axios.post('/passwordless-login/token')
  let { data } = await axios.post('/passwordless-login', {
    email,
    device_name: userAgentDevice(),
  })
  return data
}

export async function passwordlessLoginReceiveToken(email, code) {
  let { data } = await axios.post('/passwordless-login/token', {
    email,
    code,
    device_name: userAgentDevice(),
  })
  return data.token
}

export async function csrfCookie() {
  return await axios.get('/sanctum/csrf-cookie')
}

export async function signup({ email, password } = {}) {
  return (
    await axios.post('/api/v1/signup', {
      email,
      password,
    })
  )?.data
}

export async function emailIsAvailableForSignup(email) {
  let res = await axios.get(`/api/v1/signup/email_is_available/${email}`)
  return res.data.email_is_available && res.data.email_is_valid
}

export async function sendPasswordReset(email) {
  return await axios.post('/api/v1/forgot-password', {
    email,
  })
}

export async function enableTwoFactorAuth() {
  return (await axios.post('/api/v1/user/two-factor-auth')).data
}

export async function confirmTwoFactorAuth(code) {
  return (await axios.post('/api/v1/user/two-factor-auth/confirm', { code }))
    .data
}

export async function checkTwoFactorAuthEnabled(email, password) {
  return (await axios.post('/check-account-for-2fa', { email, password })).data
    .enabled
}

// export async function version() {
//     return await axios.get('/api/v1/version')
// }

// export async function deleteAccount(password) {
//     return await axios.delete('/api/v1/account', { data: { password } })
// }
