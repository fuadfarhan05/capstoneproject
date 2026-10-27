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
import { useNavigate } from 'react-router-dom'

// Top-right corner of every page: Log in / Sign up for guests, an avatar
// menu with Log out once someone is logged in.
// onOpenAuth(mode) opens the page's AuthModal on 'login' or 'signup'.
const AccountButtons = ({ onOpenAuth }) => {
  const navigate = useNavigate()
  const { user, loading } = useAuth()

  // Firebase restores the session asynchronously on page load; render
  // nothing until it's done so guests' buttons don't flash for logged-in users
  if (loading) return null

  if (!user) {
    return (
      <ButtonGroup>
        <Button
          onClick={() => onOpenAuth('login')}
          bg='#2879CF'
          color='white'
          boxShadow='0 8px 20px rgba(40,121,207,0.25)'
          _hover={{
            bg: '#1E65B0',
            transform: 'translateY(-2px)',
            boxShadow: '0 10px 24px rgba(40,121,207,0.32)',
          }}
        >
          Log in
        </Button>
        <Button
          onClick={() => onOpenAuth('signup')}
          bg='white'
          color='black'
          boxShadow='0 8px 20px rgba(40,121,207,0.25)'
          _hover={{
            bg: 'gray.100',
            transform: 'translateY(-2px)',
            boxShadow: '0 10px 24px rgba(40,121,207,0.32)',
          }}
        >
          Sign up
        </Button>
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
          <Menu.Content
            borderRadius='xl'
            minW='220px'
            onClick={() => navigate('/profile')}
          >
            <Menu.ItemGroup
              borderRadius='xl'
              _hover={{
                bg: 'blue.100',
                transform: 'translateY(-2px)',
                boxShadow: 'md',
              }}
            >
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
              _hover={{
                bg: 'blue.100',
                transform: 'translateY(-2px)',
                boxShadow: 'md',
              }}
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
