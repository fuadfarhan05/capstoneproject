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

const LoginPage = () => {
  const navigate = useNavigate()
  return (
    <Center minH='100vh'>
      <form>
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

              <Input placeholder='Enter your username or email' w='full' />

              <Input
                type='password'
                placeholder='Enter your password'
                w='full'
              />

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
