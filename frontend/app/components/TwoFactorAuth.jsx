import { t } from '../../lib/helper'
import * as api from '../../lib/api'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function TwoFactorAuth() {
  const [setupTwoFactorResult, setSetupTwoFactorResult] = useState(null)
  const [confirmValue, setConfirmValue] = useState(null)
  const navigate = useNavigate()

  async function enable2fa() {
    let result = await api.enableTwoFactorAuth()
    setSetupTwoFactorResult(result)
  }

  async function submitConfirm(ev) {
    if (confirmValue) {
      ev.preventDefault()
      let result = await api.confirmTwoFactorAuth(confirmValue)
      if (result.confirmed_at) {
        alert(t('Two-factor-auth is enabled'))
        navigate('/home?message=2fa_activated')
      } else {
        alert(
          t(
            'Two-factor-auth could not be confirmed. Please check for correct code'
          )
        )
      }
    }
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>{t('Setup two-factor-auth')}</h1>

      {setupTwoFactorResult ? (
        <div style={{ paddingTop: '1rem' }}>
          <p>
            {t(
              'Please scan the QR code below and keep it in your password manager'
            )}
            :
          </p>
          <br></br>
          <div
            style={{ display: 'grid', placeContent: 'center' }}
            dangerouslySetInnerHTML={{
              __html: setupTwoFactorResult.two_factor_qr_code_svg,
            }}
          />
          <br></br>
          <p>
            <input
              type="text"
              value={setupTwoFactorResult.two_factor_qr_code_svg_url}
            ></input>
          </p>
          <br />
          <div>
            <p>{t('Please store the recovery code below')}:</p>
            <br></br>
            <textarea>
              {setupTwoFactorResult.two_factor_recovery_codes}
            </textarea>
          </div>
          <div>
            <p>{t('Please enter the code from your authenticator app')}:</p>
            <br />
            <form
              style={{
                display: 'flex',
                justifyContent: 'center',
                flexDirection: 'column',
              }}
              onSubmit={submitConfirm}
            >
              <input
                type="text"
                inputMode="numeric"
                pattern="\d{6,}"
                maxLength={6}
                required={true}
                placeholder={t('6-digit-code')}
                name="confirmOTP"
                autoFocus={true}
                onChange={(ev) => setConfirmValue(ev.target.value)}
              />
              <br />
              <button type="submit">{t('Confirm and enable')}</button>
            </form>
          </div>
        </div>
      ) : (
        <button onClick={enable2fa}>{t('Enable two-factor-auth')}</button>
      )}
    </div>
  )
}
