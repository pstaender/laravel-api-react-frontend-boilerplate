import { useAtom } from 'jotai'
import { currentUserState } from '../states/currentUserState'
import { Link } from 'react-router-dom'
import { t } from '../../lib/helper'
export function Home() {
  const [user] = useAtom(currentUserState)
  return (
    <center>
      <h1>{t('Welcome %{name}!', { name: user.email })}</h1>
      <br></br>
        {user.two_factor_confirmed_at ? '' : (
        <p>
          <Link to="/setup-2fa">{t('Setup two-factor-authentication')}</Link>
        </p>
      )}
      <p>
        <Link to="/logout">{t('Log out')}</Link>
      </p>
    </center>
  )
}
