import { Center, Box, Heading, Input, Button, VStack } from '@chakra-ui/react'
const LoginPage = () => {
  return (
    <Center>
      <form>
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
            />
            <Input placeholder='Enter in your password' w={{ md: 300 }} />
            <Button>Login</Button>
          </VStack>
        </Box>
      </form>
    </Center>
  )
}
export default LoginPage
