import { useState } from 'react'
import { Center, Box, Heading, Input, Button, VStack, Text } from '@chakra-ui/react'
import { signUp } from '../auth'

const SignUpPage = () => {
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
    <Center>
      <form onSubmit={handleSignUp}>
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
            <Heading>Sign Up</Heading>
            <Input
              placeholder='Enter in your email'
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
            <Button type='submit'>Sign Up</Button>
          </VStack>
        </Box>
      </form>
    </Center>
  )
}

export default SignUpPage