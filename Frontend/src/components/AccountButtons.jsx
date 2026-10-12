import { Avatar, Button, ButtonGroup } from '@chakra-ui/react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/contexts'

// Top-right corner: Log in / Sign up for guests, a profile avatar once logged in
const AccountButtons = () => {
  const { user, authReady, openAuth } = useAuth()

  // avoid flashing the guest buttons while Firebase restores the session
  if (!authReady) return null

  if (user) {
    return (
      <Link to='/profile' aria-label='Your profile'>
        <Avatar.Root
          size='md'
          transition='box-shadow 0.2s'
          _hover={{ shadow: 'md' }}
        >
          <Avatar.Fallback name={user.displayName || user.email} />
          {user.photoURL && <Avatar.Image src={user.photoURL} />}
        </Avatar.Root>
      </Link>
    )
  }

  return (
    <ButtonGroup>
      <Button variant='outline' onClick={() => openAuth('login')}>
        Log in
      </Button>
      <Button onClick={() => openAuth('signup')}>Sign up</Button>
    </ButtonGroup>
  )
}

export default AccountButtons
