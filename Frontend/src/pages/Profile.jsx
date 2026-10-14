import { useRef, useState } from 'react'
import {
  Avatar,
  Box,
  Button,
  ButtonGroup,
  Center,
  Heading,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react'
import { Camera, UserRound } from 'lucide-react'
import { useAuth } from '../AuthContext'
import { uploadProfilePicture } from '../auth'
import AuthModal from '../components/AuthModal'
import SavedEventsCollection from '../components/SavedEventsCollection'

const MAX_PHOTO_MB = 5
const circleSize = { base: '160px', md: '200px' }

// Big circle with the user's picture; clicking it opens the file picker
const ProfilePicture = ({ user }) => {
  const { refreshUser } = useAuth()
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow picking the same file again later
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
      await uploadProfilePicture(file)
      refreshUser()
    } catch (err) {
      console.error(err.code, err.message)
      setError('Could not upload your picture. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <VStack gap={3}>
      <Box
        as='button'
        type='button'
        position='relative'
        borderRadius='full'
        cursor='pointer'
        className='group'
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        aria-label={
          user.photoURL ? 'Change profile picture' : 'Add profile picture'
        }
        _focusVisible={{ outline: '2px solid', outlineOffset: '4px' }}
      >
        <Avatar.Root boxSize={circleSize} shadow='lg'>
          <Avatar.Fallback>
            <Box
              opacity={uploading ? 0 : 1}
              transition='opacity 0.2s'
              _groupHover={{ opacity: 0 }}
            >
              <UserRound size={72} strokeWidth={1.25} />
            </Box>
          </Avatar.Fallback>
          {user.photoURL && <Avatar.Image src={user.photoURL} />}
        </Avatar.Root>

        {/* dark overlay with a camera on hover (and a spinner while uploading) */}
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
            <Spinner size='lg' />
          ) : (
            <VStack gap={1}>
              <Camera size={28} />
              <Text fontSize='sm' fontWeight='semibold'>
                {user.photoURL ? 'Change photo' : 'Add photo'}
              </Text>
            </VStack>
          )}
        </Center>

        {/* always-visible badge so it's discoverable on touch screens */}
        <Center
          position='absolute'
          bottom={{ base: 2, md: 3 }}
          right={{ base: 2, md: 3 }}
          boxSize={11}
          borderRadius='full'
          bg='gray.900'
          color='white'
          borderWidth='4px'
          borderColor='bg'
        >
          <Camera size={18} />
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

const Profile = () => {
  const { user, loading } = useAuth()
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')

  const openAuth = (mode) => {
    setAuthMode(mode)
    setAuthOpen(true)
  }

  if (loading) {
    return (
      <Center pt='25vh'>
        <Spinner size='lg' />
      </Center>
    )
  }

  if (!user) {
    return (
      <VStack gap={4} pt={{ base: '10vh', md: '15vh' }} textAlign='center'>
        <Center boxSize={circleSize} borderRadius='full' bg='bg.muted'>
          <UserRound size={72} strokeWidth={1.25} />
        </Center>
        <Heading size='2xl' mt={2}>
          Log in to see your profile
        </Heading>
        <Text color='fg.muted'>
          Add a profile picture once you&apos;re signed in.
        </Text>
        <ButtonGroup mt={2}>
          <Button variant='outline' onClick={() => openAuth('login')}>
            Log in
          </Button>
          <Button onClick={() => openAuth('signup')}>Sign up</Button>
        </ButtonGroup>

        <AuthModal
          open={authOpen}
          mode={authMode}
          onModeChange={setAuthMode}
          onClose={() => setAuthOpen(false)}
        />
      </VStack>
    )
  }

  return (
    <VStack gap={5} pt={{ base: '6vh', md: '10vh' }} textAlign='center'>
      <ProfilePicture user={user} />
      <Box>
        <Heading size={{ base: '2xl', md: '3xl' }} letterSpacing='tight'>
          {user.displayName || user.email.split('@')[0]}
        </Heading>
        <Text color='fg.muted' mt={1}>
          {user.email}
        </Text>
      </Box>
      <Box w='100%' mt={{ base: 4, md: 8 }}>
        <SavedEventsCollection />
      </Box>
    </VStack>
  )
}

export default Profile
