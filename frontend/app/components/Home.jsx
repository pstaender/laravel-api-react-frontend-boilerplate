import { useAtom } from 'jotai'
import { currentUserState } from '../states/currentUserState'
import { Link } from 'react-router-dom'
export function Home() {
  const [user] = useAtom(currentUserState)
  return (
    <center>
      <h1>Welcome {user.email}!</h1>
      <br></br>
      <p>
        <Link to="/logout">Logout</Link>
      </p>
    </center>
  )
}
