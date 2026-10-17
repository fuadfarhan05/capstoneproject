import {
  VStack,
  Box,
  Heading,
  Text,
  HStack,
  SimpleGrid,
} from '@chakra-ui/react'
import { useState } from 'react'
import Filter from '../components/Filter'

const SavedActivies = ({ savedActivities = [] }) => {
  const [city, setCity] = useState('')
  const [distance, setDistance] = useState('')
  const [price, setPrice] = useState('')
  const [sort, setSort] = useState('')

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

  return (
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
      <Box borderRadius='md' shadow='sm' h={200}>
        {filteredActivities.length > 0 ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
            {filteredActivities.map((activity) => (
              <Box key={activity.id} p={4} borderWidth='1px' borderRadius='xl'>
                <Heading size='md'>{activity.name}</Heading>
                <Text color='gray.500'>{activity.city}</Text>
              </Box>
            ))}
          </SimpleGrid>
        ) : (
          <Text pt={8} textAlign='center' color='gray.500'>
            No saved activities found.
          </Text>
        )}
      </Box>
    </VStack>
  )
}

export default SavedActivies
