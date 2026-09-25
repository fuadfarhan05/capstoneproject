import { useState } from 'react'
import {
  Center,
  Box,
  Heading,
  Input,
  Button,
  VStack,
  Text,
  Field,
} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { signUp } from '../auth'

const SignUpPage = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSignUp = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const userCredential = await signUp(email, password)
      console.log('User created:', userCredential.user)
      // redirect to homepage/dashboard here
    } catch (err) {
      console.error(err.message)
      setError('Could not create account. Email may already be in use.')
    }
  }

  return (
    <Center minH='100vh'>
      <form onSubmit={handleSignUp}>
        <VStack gap={6}>
          <Heading size={{ md: '5xl' }} textAlign='center'>
            Capstone Project
          </Heading>

          <Box
            mt={{ md: '8vh' }}
            borderWidth={1}
            borderRadius='lg'
            shadow='lg'
            w={{ base: '90vw', md: 450 }}
            h={{ base: 450, md: 400 }}
            display='flex'
            justifyContent='center'
            alignItems='center'
          >
            <VStack gap={5} w='full' px={8}>
              <Heading size='lg'>Create an Account</Heading>

              <Field.Root orientation='horizontal'>
                <Field.Label>Username</Field.Label>
                <Input placeholder='Enter your username' w='full' />
              </Field.Root>

              <Field.Root orientation='horizontal'>
                <Field.Label>Email</Field.Label>
                <Input
                  type='email'
                  placeholder='Enter your email'
                  w='full'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field.Root>

              <Field.Root orientation='horizontal'>
                <Field.Label>Password</Field.Label>
                <Input
                  type='password'
                  placeholder='Enter your password'
                  w='full'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Field.Root>

              <Field.Root orientation='horizontal'>
                <Field.Label>Confirm Password</Field.Label>
                <Input
                  type='password'
                  placeholder='Confirm your password'
                  w='full'
                />
              </Field.Root>

              {error && <Text color='red.500'>{error}</Text>}

              <Button type='submit' w='full'>
                Sign Up
              </Button>

              <Text>
                Already have an account?
                <Button
                  variant='subtle'
                  size='sm'
                  onClick={() => navigate('/login')}
                >
                  Login
                </Button>
              </Text>
            </VStack>
          </Box>
        </VStack>
      </form>
    </Center>
  )
}

export default SignUpPage