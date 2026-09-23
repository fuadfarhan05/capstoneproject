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

const SignUpPage = () => {
  const navigate = useNavigate()
  return (
    <Center minH='100vh'>
      <form>
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
                <Input type='email' placeholder='Enter your email' w='full' />
              </Field.Root>

              <Field.Root orientation='horizontal'>
                <Field.Label>Password</Field.Label>
                <Input
                  type='password'
                  placeholder='Enter your password'
                  w='full'
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
