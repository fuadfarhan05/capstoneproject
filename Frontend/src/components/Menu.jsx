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
} from '@chakra-ui/react'
import { Link } from 'react-router-dom'
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
import { UserTile } from '../components/index'

const Menu = () => {
  const [open, setOpen] = useState(false)
  const { user, loading } = useAuth()
  const [authMode, setAuthMode] = useState('login')

  const openAuth = (mode) => {
    setAuthMode(mode)
    // setAuthOpen(true)
  }

  const handleSignOut = () => {}

  const onSignIn = () => {}

  return (
    <>
      {' '}
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
          <Drawer.Content position='relative' overflow='visible'>
            <Drawer.Header>
              <Box spaceY={4}>
                <Drawer.Title fontSize='2xl'>Menu</Drawer.Title>
                {user && <UserTile user={user} />}
              </Box>
            </Drawer.Header>
            <Separator />

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
                >
                  <Search size={20} />
                  <Text>Search</Text>
                  <ArrowRight size={16} />
                </HStack>

                <HStack
                  as={Link}
                  to='/saved-activies'
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
                >
                  <Bookmark size={20} />
                  <Text>Saved Activities</Text>
                </HStack>

                <HStack
                  as={Link}
                  to='/groups'
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
                >
                  <UserPen size={20} />
                  <Text>Profile</Text>
                </HStack>
              </VStack>
              <Separator />
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
                // backgroundPosition='100% center'
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
                // backgroundPosition='100% center'
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
              </Switch.Root>{' '}
              {user ? (
                <Button onClick={handleSignOut}>Sign Out</Button>
              ) : (
                <Button onClick={onSignIn}>Sign In</Button>
              )}
              <Button variant='solid' onClick={() => setOpen(false)}>
                Close
              </Button>
            </Drawer.Footer>
          </Drawer.Content>
        </Drawer.Positioner>
      </Drawer.Root>
    </>
  )
}

export default Menu
