import { VStack, Box, Heading, Text, HStack } from '@chakra-ui/react'
import { useState } from 'react'
import { useAuth } from '../AuthContext'
import { useSavedEvents } from '../SavedEventsContext'
import Filter from '../components/Filter'
import EventCard from '../components/EventCard'

const cityAliases = {
  'new-york-city': ['new york city', 'new york', 'nyc'],
  chicago: ['chicago', 'chicago, il', 'chicago, illinois'],
  'san-francisco': [
    'san francisco',
    'san francisco, ca',
    'san francisco, california',
    'sf',
  ],
}

const SavedActivities = () => {
  const { user, loading } = useAuth()
  const { savedEvents } = useSavedEvents()

  const [city, setCity] = useState('')
  const [distance, setDistance] = useState('')
  const [price, setPrice] = useState('')
  const [sort, setSort] = useState('')

  const filteredActivities = [...savedEvents]
    .filter((activity) => {
      if (!city) return true

      const eventCity = (activity.city ?? '').trim().toLowerCase()
      const acceptedCities = cityAliases[city] ?? []

      return acceptedCities.includes(eventCity)
    })
    .filter(
      (activity) =>
        !distance ||
        (activity.distance != null &&
          Number(activity.distance) <= Number(distance))
    )
    .filter(
      (activity) =>
        !price ||
        (activity.price != null && Number(activity.price) <= Number(price))
    )
    .sort((a, b) => {
      if (sort === 'price-asc') {
        return (a.price ?? Infinity) - (b.price ?? Infinity)
      }

      if (sort === 'price-desc') {
        return (b.price ?? -Infinity) - (a.price ?? -Infinity)
      }

      if (sort === 'distance') {
        return (a.distance ?? Infinity) - (b.distance ?? Infinity)
      }

      if (sort === 'rating') {
        return (b.rating ?? 0) - (a.rating ?? 0)
      }

      return 0
    })

  if (loading) {
    return (
      <Box p={8} textAlign='center'>
        <Text>Checking your account...</Text>
      </Box>
    )
  }

  if (!user) {
    return (
      <VStack align='center' gap={4} py={16} px={6}>
        <Heading size='xl'>Saved Activities</Heading>

        <Text color='gray.500' textAlign='center'>
          Log in to view and manage your saved activities.
        </Text>
      </VStack>
    )
  }

  return (
    <VStack align='stretch' gap={8} w='100%'>
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
        <Box
          display='grid'
          gridTemplateColumns='repeat(auto-fill, minmax(min(100%, 280px), 1fr))'
          gap={6}
        >
          {filteredActivities.map((event) => (
            <EventCard key={event.id} event={event} view='gallery' />
          ))}
        </Box>
      ) : (
        <Box py={8} textAlign='center'>
          <Text color='gray.500'>
            {savedEvents.length === 0
              ? "You haven't saved any activities yet."
              : 'No saved activities match your selected filters.'}
          </Text>
        </Box>
      )}
    </VStack>
  )
}

export default SavedActivities
