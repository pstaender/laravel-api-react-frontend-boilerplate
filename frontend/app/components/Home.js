import { useRecoilState } from 'recoil'
import { currentUserState } from '../states/currentUserState'
import { Link } from 'react-router-dom'
export function Home() {
  const [user] = useRecoilState(currentUserState)
  return (
    <center>
      <h1>Welcome {user}!</h1>
      <br></br>
      <p>
        <Link to="/logout">Logout</Link>
      </p>
    </center>
  )
}
