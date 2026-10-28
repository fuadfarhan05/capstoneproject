import { useState } from 'react'
import {
  Drawer,
  VStack,
  Image,
  IconButton,
  Button,
  HStack,
  Text,
  Box,
  Switch,
  Separator,
  ButtonGroup,
} from '@chakra-ui/react'
import { Link } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
import menuImage from '../assets/menuImage.png'
import {
  Bookmark,
  ArrowRight,
  House,
  Search,
  UserPen,
  PlaneTakeoff,
} from 'lucide-react'
import Airplane from '../assets/pngwing.com.png'
import { useAuth } from '../AuthContext'
import { UserTile, AuthModal } from '../components/index'

const Menu = () => {
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [open, setOpen] = useState(false)
  const { user } = useAuth()

  const openAuth = (mode) => {
    setAuthMode(mode)
    setAuthOpen(true)
    setOpen(false)
  }

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      setOpen(false)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <>
      {/* Menu image button */}
      <IconButton
        variant='ghost'
        onClick={() => setOpen(true)}
        aria-label='Open menu'
      >
        <Image src={menuImage} alt='Menu' boxSize='32px' />
      </IconButton>

      {/* Menu drawer */}
      <Drawer.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
        <Drawer.Backdrop />

        <Drawer.Positioner>
          <Drawer.Content position='relative' overflow='visible' bg='gray.100'>
            <Drawer.Header>
              <Box spaceY={4}>
                <Drawer.Title fontSize='2xl'>Menu</Drawer.Title>
                {user && <UserTile user={user} />}
              </Box>
            </Drawer.Header>

            <Separator borderColor='black' />

            <Drawer.Body>
              <VStack align='stretch' gap={4}>
                <HStack
                  as={Link}
                  to='/'
                  gap={2}
                  px={4}
                  py={3}
                  borderRadius='xl'
                  fontWeight='semibold'
                  cursor='pointer'
                  transition='all 0.2s'
                  _hover={{
                    bg: 'blue.100',
                    transform: 'translateY(-2px)',
                    boxShadow: 'md',
                  }}
                  onClick={() => setOpen(false)}
                >
                  <House size={20} />
                  <Text>Home</Text>
                </HStack>

                <HStack
                  as={Link}
                  to='/results'
                  gap={2}
                  px={4}
                  py={3}
                  borderRadius='xl'
                  fontWeight='semibold'
                  cursor='pointer'
                  transition='all 0.2s'
                  _hover={{
                    bg: 'blue.100',
                    transform: 'translateY(-2px)',
                    boxShadow: 'md',
                  }}
                  onClick={() => setOpen(false)}
                >
                  <Search size={20} />
                  <Text>Search</Text>
                  <ArrowRight size={16} />
                </HStack>

                <HStack
                  as={Link}
                  to='/saved-activities'
                  gap={2}
                  px={4}
                  py={3}
                  borderRadius='xl'
                  fontWeight='semibold'
                  cursor='pointer'
                  transition='all 0.2s'
                  _hover={{
                    bg: 'blue.100',
                    transform: 'translateY(-2px)',
                    boxShadow: 'md',
                  }}
                  onClick={() => setOpen(false)}
                >
                  <Bookmark size={20} />
                  <Text>Saved Activities</Text>
                </HStack>

                <HStack
                  as={Link}
                  to='/plans'
                  gap={2}
                  px={4}
                  py={3}
                  borderRadius='xl'
                  fontWeight='semibold'
                  cursor='pointer'
                  transition='all 0.2s'
                  _hover={{
                    bg: 'blue.100',
                    transform: 'translateY(-2px)',
                    boxShadow: 'md',
                  }}
                  onClick={() => setOpen(false)}
                >
                  <PlaneTakeoff size={20} />
                  <Text>Plans</Text>
                </HStack>

                <HStack
                  as={Link}
                  to='/profile'
                  gap={2}
                  px={4}
                  py={3}
                  borderRadius='xl'
                  fontWeight='semibold'
                  cursor='pointer'
                  transition='all 0.2s'
                  _hover={{
                    bg: 'blue.100',
                    transform: 'translateY(-2px)',
                    boxShadow: 'md',
                  }}
                  onClick={() => setOpen(false)}
                >
                  <UserPen size={20} />
                  <Text>Profile</Text>
                </HStack>
              </VStack>

              <Separator borderColor='black' />
            </Drawer.Body>

            {!user ? (
              <Box
                height='120%'
                position='absolute'
                inset='0'
                zIndex='0'
                pointerEvents='none'
                backgroundImage={`url(${Airplane})`}
                backgroundSize='60%'
                backgroundPositionX='90%'
                backgroundPositionY='55%'
                backgroundRepeat='no-repeat'
                transform='rotate(100deg)'
                overflow='visible'
              />
            ) : (
              <Box
                height='120%'
                position='absolute'
                inset='0'
                zIndex='0'
                pointerEvents='none'
                backgroundImage={`url(${Airplane})`}
                backgroundSize='45%'
                backgroundPositionX='100%'
                backgroundPositionY='58%'
                backgroundRepeat='no-repeat'
                transform='rotate(100deg)'
                overflow='visible'
              />
            )}

            <Drawer.Footer>
              <Switch.Root>
                <Switch.HiddenInput />
              </Switch.Root>

              {user ? (
                <Button
                  bg='#2879CF'
                  color='white'
                  boxShadow='0 8px 20px rgba(40,121,207,0.25)'
                  _hover={{
                    bg: '#1E65B0',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 10px 24px rgba(40,121,207,0.32)',
                  }}
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              ) : (
                <Button
                  bg='#2879CF'
                  color='white'
                  boxShadow='0 8px 20px rgba(40,121,207,0.25)'
                  _hover={{
                    bg: '#1E65B0',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 10px 24px rgba(40,121,207,0.32)',
                  }}
                  onClick={() => openAuth('login')}
                >
                  Log in
                </Button>
              )}

              <ButtonGroup colorPalette={'#2879CF'}>
                <Button
                  bg='white'
                  color='black'
                  boxShadow='0 8px 20px rgba(40,121,207,0.25)'
                  _hover={{
                    bg: 'gray.100',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 10px 24px rgba(40,121,207,0.32)',
                  }}
                  onClick={() => setOpen(false)}
                >
                  Close
                </Button>
              </ButtonGroup>
            </Drawer.Footer>
          </Drawer.Content>
        </Drawer.Positioner>
      </Drawer.Root>

      {/* Authentication popup */}
      <AuthModal
        open={authOpen}
        mode={authMode}
        onModeChange={setAuthMode}
        onClose={() => setAuthOpen(false)}
      />
    </>
  )
}

export default Menu
