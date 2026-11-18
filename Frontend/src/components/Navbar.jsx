import { Box, Flex, Heading, VStack, Separator } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import Menu from './Menu'
import AuthModal from '../components/AuthModal'
import AccountButtons from './AccountButtons'
import { useState } from 'react'
import { Outlet } from 'react-router-dom'

const layoutTransition = {
  duration: 0.55,
  ease: [0.22, 1, 0.36, 1],
}

const Navbar = () => {
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState('signup')
  const [darkMode, setDarkMode] = useState(false)

  const openAuth = (mode) => {
    setAuthMode(mode)
    setAuthOpen(true)
  }

  const navigate = useNavigate()

  return (
    <Box minH='100vh' px={{ base: 4, md: 12, lg: 20 }} pb={16} bg='#EAF9FF'>
      <VStack align='stretch' gap={5}>
        <Flex justify='flex-start' minH={10} pt={5}>
          <Menu darkMode={darkMode} setDarkMode={setDarkMode} />

          <Heading
            ml={4}
            asChild
            size={{ base: 'xl', md: '3xl' }}
            fontWeight='extrabold'
            letterSpacing='-0.04em'
            color='#12304A'
            onClick={() => navigate('/')}
            cursor='pointer'
          >
            <motion.h1 layout transition={layoutTransition}>
              Triply
            </motion.h1>
          </Heading>
        </Flex>

        <Box
          position='absolute'
          top={4}
          right={{ base: 4, md: 12, lg: 20 }}
          zIndex={1}
        >
          <AccountButtons onOpenAuth={openAuth} />
        </Box>

        <AuthModal
          open={authOpen}
          mode={authMode}
          onModeChange={setAuthMode}
          onClose={() => setAuthOpen(false)}
        />
        <Separator borderColor='black' />
        <Outlet />
      </VStack>
    </Box>
  )
}

export default Navbar
