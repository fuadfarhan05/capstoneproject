import { useState } from 'react'
import {
  Dialog,
  Portal,
  CloseButton,
  Input,
  Button,
  VStack,
  Text,
  Field,
} from '@chakra-ui/react'

import { logIn, signUp } from '../auth'

// Firebase error codes -> messages a user can act on
const authErrorMessages = {
  'auth/invalid-credential': 'Incorrect email or password',
  'auth/invalid-email': 'Please enter a valid email address',
  'auth/user-disabled': 'This account has been disabled',
  'auth/email-already-in-use':
    'An account with this email already exists. Try logging in instead.',
  'auth/weak-password': 'Password must be at least 6 characters',
  'auth/too-many-requests':
    'Too many attempts. Please wait a minute and try again.',
  'auth/network-request-failed':
    'Could not reach the server. Check your internet connection.',
}

// mode is 'login' or 'signup'; the parent controls it so the corner buttons
// and "Find Activities" can open the modal on the right form
const AuthModal = ({ open, mode, onModeChange, onClose }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isSignUp = mode === 'signup'

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setError('')
  }

  const switchMode = (newMode) => {
    setError('')
    onModeChange(newMode)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const userCredential = isSignUp
        ? await signUp(email, password)
        : await logIn(email, password)
      console.log(
        isSignUp ? 'User created:' : 'Logged in:',
        userCredential.user
      )
      resetForm()
      onClose()
      // redirect to homepage/dashboard here
    } catch (err) {
      console.error(err.code, err.message)
      setError(
        authErrorMessages[err.code] ??
          (isSignUp
            ? 'Could not create your account. Please try again.'
            : 'Could not log in. Please try again.')
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(e) => {
        if (!e.open) {
          resetForm()
          onClose()
        }
      }}
      placement='center'
      motionPreset='slide-in-bottom'
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content borderRadius='2xl' mx={4} bg='gray.100'>
            <form onSubmit={handleSubmit}>
              <Dialog.Header justifyContent='center'>
                <Dialog.Title>{isSignUp ? 'Sign up' : 'Log in'}</Dialog.Title>
              </Dialog.Header>

              <Dialog.Body>
                <VStack gap={4}>
                  <Field.Root>
                    <Field.Label>Email</Field.Label>
                    <Input
                      bg='white'
                      type='email'
                      placeholder='Enter your email'
                      borderRadius='full'
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </Field.Root>

                  <Field.Root>
                    <Field.Label>Password</Field.Label>
                    <Input
                      bg='white'
                      type='password'
                      placeholder='Enter your password'
                      borderRadius='full'
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </Field.Root>

                  {isSignUp && (
                    <Field.Root>
                      <Field.Label>Confirm Password</Field.Label>
                      <Input
                        bg='white'
                        type='password'
                        placeholder='Confirm your password'
                        borderRadius='full'
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </Field.Root>
                  )}

                  {error && <Text color='red.500'>{error}</Text>}
                </VStack>
              </Dialog.Body>

              <Dialog.Footer flexDirection='column' gap={3}>
                <Button
                  type='submit'
                  w='full'
                  loading={loading}
                  bg='#2879CF'
                  color='white'
                  boxShadow='0 8px 20px rgba(40,121,207,0.25)'
                  _hover={{
                    bg: '#1E65B0',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 10px 24px rgba(40,121,207,0.32)',
                  }}
                >
                  {isSignUp ? 'Sign up' : 'Log in'}
                </Button>

                <Text fontSize='sm'>
                  {isSignUp
                    ? 'Already have an account?'
                    : "Don't have an account?"}{' '}
                  <Button
                    variant='plain'
                    size='sm'
                    px={1}
                    textDecoration='underline'
                    onClick={() => switchMode(isSignUp ? 'login' : 'signup')}
                  >
                    {isSignUp ? 'Log in' : 'Sign up'}
                  </Button>
                </Text>
              </Dialog.Footer>
            </form>

            <Dialog.CloseTrigger asChild>
              <CloseButton size='sm' />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}

export default AuthModal
