import { useState } from 'react'
import { Center, Box, Heading, Input, Button, VStack, Text } from '@chakra-ui/react'
import { logIn } from '../auth'

const LoginPage = () => {
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
    <Center>
      <form onSubmit={handleLogIn}>
        <Heading mt={8} size={{ md: '5xl' }}>
          Capstone Project
        </Heading>
        <Box
          mt={{ md: '25vh' }}
          borderWidth={1}
          spaceY={4}
          shadow='lg'
          w={{ md: 450 }}
          h={{ md: 300 }}
          display='flex'
          justifyContent='center'
          alignItems='center'
        >
          <VStack mt={2} mb={2}>
            <Heading>Login</Heading>
            <Input
              placeholder='Enter in your username or email'
              w={{ md: 300 }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              placeholder='Enter in your password'
              w={{ md: 300 }}
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <Text color='red.500'>{error}</Text>}
            <Button type='submit'>Login</Button>
          </VStack>
        </Box>
      </form>
    </Center>
  )
}

export default LoginPage