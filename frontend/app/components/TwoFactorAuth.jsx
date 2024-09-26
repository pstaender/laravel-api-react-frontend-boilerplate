import { t } from '../../lib/helper'

export function TwoFactorAuth() {
  return (
    <div>
      <h1>{t('Setup two-factor-auth')}</h1>
      <p>{t('Scan the QR code with your authenticator app')}</p>
    </div>
  )
}
