import { useState } from 'react'
import {
  Center,
  Box,
  Heading,
  Input,
  Button,
  VStack,
  Text,
} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { logIn } from '../auth'

const LoginPage = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogIn = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const userCredential = await logIn(email, password)
      console.log('Logged in:', userCredential.user)
      // redirect to homepage/dashboard here
    } catch (err) {
      console.error(err.message)
      setError('Incorrect email or password')
    }
  }

  return (
    <Center minH='100vh'>
      <form onSubmit={handleLogIn}>
        <VStack gap={6}>
          <Heading size={{ md: '5xl' }} textAlign='center'>
            Capstone Project
          </Heading>

          <Box
            mt={{ md: '10vh' }}
            borderWidth={1}
            borderRadius='lg'
            shadow='lg'
            w={{ base: '90vw', md: 450 }}
            h={{ base: 350, md: 300 }}
            display='flex'
            justifyContent='center'
            alignItems='center'
          >
            <VStack gap={5} w='full' px={8}>
              <Heading size='lg'>Login</Heading>

              <Input
                placeholder='Enter your username or email'
                w='full'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Input
                type='password'
                placeholder='Enter your password'
                w='full'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {error && <Text color='red.500'>{error}</Text>}

              <Button type='submit' w='full'>
                Login
              </Button>

              <Text>
                Don't have an account?{' '}
                <Button
                  variant='subtle'
                  size='sm'
                  onClick={() => navigate('/signup')}
                >
                  Sign Up
                </Button>
              </Text>
            </VStack>
          </Box>
        </VStack>
      </form>
    </Center>
  )
}

export default LoginPage
