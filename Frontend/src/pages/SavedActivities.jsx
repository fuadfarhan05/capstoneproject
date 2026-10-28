import {
  VStack,
  Box,
  Heading,
  Text,
  HStack,
  SimpleGrid,
  Button,
  Flex,
} from '@chakra-ui/react'
import { useState } from 'react'
import { useAuth } from '../AuthContext'
import Filter from '../components/Filter'
import AuthModal from '../components/AuthModal'

const SavedActivities = ({ savedActivities = [] }) => {
  const { user, loading } = useAuth()
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')

  const [city, setCity] = useState('')
  const [distance, setDistance] = useState('')
  const [price, setPrice] = useState('')
  const [sort, setSort] = useState('')

  const openAuth = (mode) => {
    setAuthMode(mode)
    setAuthOpen(true)
  }

  const filteredActivities = savedActivities
    .filter((activity) => !city || activity.city === city)
    .filter((activity) => !distance || activity.distance <= Number(distance))
    .filter((activity) => !price || activity.price <= Number(price))
    .sort((a, b) => {
      if (sort === 'price-asc') return a.price - b.price
      if (sort === 'price-desc') return b.price - a.price
      if (sort === 'distance') return a.distance - b.distance
      if (sort === 'rating') return b.rating - a.rating
      return 0
    })

  if (loading) {
    return (
      <Box p={8} textAlign='center'>
        <Text>Checking your account...</Text>
      </Box>
    )
  }

  return (
    <>
      {!user ? (
        <VStack align='center' gap={4} py={16} px={6}>
          <Heading size='xl'>Saved Activities</Heading>

          <Text color='gray.500' textAlign='center'>
            Log in or sign up to save and keep track of your favorite
            activities.
          </Text>

          <Flex gap={4} justify='center' wrap='wrap'>
            <Button
              bg='#2879CF'
              color='white'
              boxShadow='0 8px 20px rgba(40,121,207,0.25)'
              _hover={{
                bg: '#1E65B0',
                transform: 'translateY(-2px)',
                boxShadow: '0 10px 24px rgba(40,121,207,0.32)',
              }}
              onClick={() => openAuth('login')}
            >
              Log in
            </Button>
            <Button
              bg='white'
              color='black'
              boxShadow='0 8px 20px rgba(40,121,207,0.25)'
              _hover={{
                bg: 'gray.100',
                transform: 'translateY(-2px)',
                boxShadow: '0 10px 24px rgba(40,121,207,0.32)',
              }}
              onClick={() => openAuth('signup')}
            >
              Sign up
            </Button>
          </Flex>
        </VStack>
      ) : (
        <VStack align='stretch' gap={8}>
          <Box>
            <Heading size={{ base: 'xl', md: '2xl' }}>Saved Activities</Heading>
            <Text color='gray.500'>Let's find something to do today</Text>
          </Box>

          <HStack gap={3} wrap='wrap'>
            <Text>Filters:</Text>

            <Filter filter='city' onChange={setCity} />
            <Filter filter='distance' onChange={setDistance} />
            <Filter filter='price' onChange={setPrice} />
            <Filter filter='sort' onChange={setSort} />
          </HStack>

          {filteredActivities.length > 0 ? (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
              {filteredActivities.map((activity) => (
                <Box
                  key={activity.id}
                  p={4}
                  borderWidth='1px'
                  borderRadius='xl'
                  bg='white'
                  shadow='sm'
                >
                  <Heading size='md'>{activity.name}</Heading>
                  <Text color='gray.500'>{activity.city}</Text>
                </Box>
              ))}
            </SimpleGrid>
          ) : (
            <Box py={8} textAlign='center'>
              <Text color='gray.500'>
                You haven't saved any activities yet.
              </Text>
            </Box>
          )}
        </VStack>
      )}

      <AuthModal
        open={authOpen}
        mode={authMode}
        onModeChange={setAuthMode}
        onClose={() => setAuthOpen(false)}
      />
    </>
  )
}

export default SavedActivities
