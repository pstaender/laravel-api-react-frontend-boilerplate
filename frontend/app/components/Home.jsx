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
      <p>
        <Link to="/logout">Logout</Link>
      </p>
    </center>
  )
}
