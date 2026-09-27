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
        userCredential.user,
      )
      resetForm()
      onClose()
      // redirect to homepage/dashboard here
    } catch (err) {
      console.error(err.message)
      setError(
        isSignUp
          ? 'Could not create account. Email may already be in use.'
          : 'Incorrect email or password',
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
          <Dialog.Content borderRadius='2xl' mx={4}>
            <form onSubmit={handleSubmit}>
              <Dialog.Header justifyContent='center'>
                <Dialog.Title>{isSignUp ? 'Sign up' : 'Log in'}</Dialog.Title>
              </Dialog.Header>

              <Dialog.Body>
                <VStack gap={4}>
                  <Field.Root>
                    <Field.Label>Email</Field.Label>
                    <Input
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
                <Button type='submit' w='full' loading={loading}>
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
