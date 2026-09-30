import {
  Box,
  ButtonGroup,
  Button,
  Flex,
  Heading,
  VStack,
} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import Menu from './Menu'
import AuthModal from '../components/AuthModal'
import { useState } from 'react'
import { Outlet } from 'react-router-dom'

const layoutTransition = {
  duration: 0.55,
  ease: [0.22, 1, 0.36, 1],
}

const Navbar = () => {
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState('signup')

  const openAuth = (mode) => {
    setAuthMode(mode)
    setAuthOpen(true)
  }

  const navigate = useNavigate()

  return (
    <Box minH='100vh' px={{ base: 4, md: 12, lg: 20 }} pb={16}>
      <VStack align='stretch' gap={5}>
        <Flex justify='flex-start' minH={10} pt={5}>
          <Menu />

          <Heading
            ml={4}
            asChild
            size={{ base: 'xl', md: '3xl' }}
            cursor='pointer'
            onClick={() => navigate('/')}
          >
            <motion.h1 layout transition={layoutTransition}>
              Capstone Project
            </motion.h1>
          </Heading>
        </Flex>

        <ButtonGroup
          position='absolute'
          top={4}
          right={{ base: 4, md: 12, lg: 20 }}
          zIndex={1}
        >
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

        <Outlet />
      </VStack>
    </Box>
  )
}

export default Navbar
