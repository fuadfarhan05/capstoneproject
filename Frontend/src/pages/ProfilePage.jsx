import { useRef, useState } from 'react'
import {
  Avatar,
  Box,
  Button,
  ButtonGroup,
  Center,
  Flex,
  Heading,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Bookmark, Camera, UserRound } from 'lucide-react'
import { useAuth, useSavedEvents } from '../context/contexts'
import { uploadProfilePicture } from '../auth'
import EventCard from '../components/EventCard'

const MAX_PHOTO_MB = 5

// Big circle avatar; clicking it opens the file picker
const ProfilePicture = ({ user }) => {
  const { setPhotoURL } = useAuth()
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // let the same file be picked again later
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file')
      return
    }
    if (file.size > MAX_PHOTO_MB * 1024 * 1024) {
      setError(`Images must be under ${MAX_PHOTO_MB} MB`)
      return
    }

    setError('')
    setUploading(true)
    try {
      setPhotoURL(await uploadProfilePicture(file))
    } catch (err) {
      console.error(err.message)
      setError('Could not upload your picture. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <VStack gap={2}>
      <Box
        as='button'
        type='button'
        position='relative'
        borderRadius='full'
        cursor='pointer'
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        aria-label='Change profile picture'
        className='group'
        _focusVisible={{ outline: '2px solid', outlineOffset: '4px' }}
      >
        <Avatar.Root boxSize={{ base: '112px', md: '136px' }} shadow='md'>
          <Avatar.Fallback fontSize='4xl'>
            <Box
              opacity={uploading ? 0 : 1}
              transition='opacity 0.2s'
              _groupHover={{ opacity: 0 }}
            >
              <UserRound size={56} strokeWidth={1.5} />
            </Box>
          </Avatar.Fallback>
          {user.photoURL && <Avatar.Image src={user.photoURL} />}
        </Avatar.Root>

        {/* hover overlay */}
        <Center
          position='absolute'
          inset={0}
          borderRadius='full'
          bg='blackAlpha.600'
          color='white'
          opacity={uploading ? 1 : 0}
          transition='opacity 0.2s'
          _groupHover={{ opacity: 1 }}
        >
          {uploading ? (
            <Spinner />
          ) : (
            <VStack gap={1}>
              <Camera size={24} />
              <Text fontSize='xs' fontWeight='semibold'>
                {user.photoURL ? 'Change photo' : 'Add photo'}
              </Text>
            </VStack>
          )}
        </Center>

        {/* small camera badge so it's obvious on touch screens too */}
        <Center
          position='absolute'
          bottom={1}
          right={1}
          boxSize={9}
          borderRadius='full'
          bg='gray.900'
          color='white'
          borderWidth='3px'
          borderColor='bg'
        >
          <Camera size={15} />
        </Center>
      </Box>

      <input
        ref={inputRef}
        type='file'
        accept='image/*'
        hidden
        onChange={handleFile}
      />
      {error && (
        <Text color='red.500' fontSize='sm'>
          {error}
        </Text>
      )}
    </VStack>
  )
}

const EmptySaved = () => {
  const navigate = useNavigate()
  return (
    <VStack
      py={16}
      gap={3}
      borderWidth='1px'
      borderStyle='dashed'
      borderRadius='2xl'
      textAlign='center'
      px={6}
    >
      <Center boxSize={14} borderRadius='full' bg='bg.muted'>
        <Bookmark size={24} />
      </Center>
      <Heading size='md'>No saved events yet</Heading>
      <Text color='fg.muted' maxW='sm'>
        Tap the bookmark on any event to save it here for later.
      </Text>
      <Button mt={2} onClick={() => navigate('/')}>
        Find activities
      </Button>
    </VStack>
  )
}

const SavedEventsGrid = ({ events }) => (
  <Box
    display='grid'
    gridTemplateColumns='repeat(auto-fill, minmax(min(100%, 280px), 1fr))'
    gap={6}
  >
    <AnimatePresence mode='popLayout'>
      {events.map((event) => (
        <motion.div
          key={event.id}
          layout
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
          transition={{ duration: 0.3 }}
        >
          <EventCard event={event} view='gallery' />
        </motion.div>
      ))}
    </AnimatePresence>
  </Box>
)

const LoggedOut = () => {
  const { openAuth } = useAuth()
  return (
    <VStack gap={4} pt='20vh' textAlign='center'>
      <Center boxSize={20} borderRadius='full' bg='bg.muted'>
        <UserRound size={36} />
      </Center>
      <Heading size='2xl'>Log in to see your profile</Heading>
      <Text color='fg.muted'>
        Your profile picture and saved events live here.
      </Text>
      <ButtonGroup mt={2}>
        <Button variant='outline' onClick={() => openAuth('login')}>
          Log in
        </Button>
        <Button onClick={() => openAuth('signup')}>Sign up</Button>
      </ButtonGroup>
    </VStack>
  )
}

const ProfilePage = () => {
  const navigate = useNavigate()
  const { user, authReady, logOut } = useAuth()
  const { savedEvents } = useSavedEvents()

  const handleLogOut = async () => {
    await logOut()
    navigate('/')
  }

  return (
    <Box minH='100vh' px={{ base: 4, md: 12, lg: 20 }} pb={16}>
      <Flex justify='space-between' align='center' pt={5} minH={10}>
        <Heading asChild size={{ base: 'xl', md: '2xl' }}>
          <Link to='/'>Capstone Project</Link>
        </Heading>
        {user && (
          <Button variant='outline' onClick={handleLogOut}>
            Log out
          </Button>
        )}
      </Flex>

      {!authReady ? (
        <Center pt='30vh'>
          <Spinner size='lg' />
        </Center>
      ) : !user ? (
        <LoggedOut />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <Flex
            direction={{ base: 'column', md: 'row' }}
            align='center'
            gap={{ base: 4, md: 8 }}
            mt={{ base: 8, md: 12 }}
            mb={{ base: 10, md: 14 }}
            textAlign={{ base: 'center', md: 'left' }}
          >
            <ProfilePicture user={user} />
            <Box>
              <Heading size={{ base: '2xl', md: '4xl' }} letterSpacing='tight'>
                {user.displayName || user.email.split('@')[0]}
              </Heading>
              <Text color='fg.muted' mt={1}>
                {user.email}
              </Text>
              <Text mt={3} fontWeight='medium'>
                {savedEvents.length} saved{' '}
                {savedEvents.length === 1 ? 'event' : 'events'}
              </Text>
            </Box>
          </Flex>

          <Heading size='xl' mb={5}>
            Saved events
          </Heading>
          {savedEvents.length === 0 ? (
            <EmptySaved />
          ) : (
            <SavedEventsGrid events={savedEvents} />
          )}
        </motion.div>
      )}
    </Box>
  )
}

export default ProfilePage
