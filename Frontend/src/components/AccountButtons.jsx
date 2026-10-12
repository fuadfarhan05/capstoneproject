import {
  Avatar,
  Button,
  ButtonGroup,
  Menu,
  Portal,
  Text,
} from '@chakra-ui/react'
import { LogOut } from 'lucide-react'
import { useAuth } from '../AuthContext'
import { logOut } from '../auth'

// Top-right corner of every page: Log in / Sign up for guests, an avatar
// menu with Log out once someone is logged in.
// onOpenAuth(mode) opens the page's AuthModal on 'login' or 'signup'.
const AccountButtons = ({ onOpenAuth }) => {
  const { user, loading } = useAuth()

  // Firebase restores the session asynchronously on page load; render
  // nothing until it's done so guests' buttons don't flash for logged-in users
  if (loading) return null

  if (!user) {
    return (
      <ButtonGroup>
        <Button variant='outline' onClick={() => onOpenAuth('login')}>
          Log in
        </Button>
        <Button onClick={() => onOpenAuth('signup')}>Sign up</Button>
      </ButtonGroup>
    )
  }

  return (
    <Menu.Root positioning={{ placement: 'bottom-end' }}>
      <Menu.Trigger
        borderRadius='full'
        cursor='pointer'
        aria-label='Account menu'
      >
        <Avatar.Root size='md'>
          <Avatar.Fallback name={user.displayName || user.email} />
          {user.photoURL && <Avatar.Image src={user.photoURL} />}
        </Avatar.Root>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content borderRadius='xl' minW='220px'>
            <Menu.ItemGroup>
              <Menu.ItemGroupLabel>
                <Text fontSize='xs' color='fg.muted' fontWeight='normal'>
                  Signed in as
                </Text>
                <Text fontSize='sm' truncate>
                  {user.email}
                </Text>
              </Menu.ItemGroupLabel>
            </Menu.ItemGroup>
            <Menu.Separator />
            <Menu.Item
              value='logout'
              borderRadius='lg'
              cursor='pointer'
              onSelect={() => logOut()}
            >
              <LogOut size={16} />
              Log out
            </Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  )
}

export default AccountButtons
