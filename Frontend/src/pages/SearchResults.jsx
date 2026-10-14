import {
  Input,
  Stack,
  Button,
  VStack,
  Box,
  Text,
  HStack,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import AuthModal from '../components/AuthModal'
import FilterSelect from '../components/FilterSelect'
import EventResults from '../components/EventResults'
import { motion } from 'motion/react'

const words = [
  'a beach',
  'a museum',
  'a boat tour',
  'an aquarium',
  'a zoo',
  'a park',
  'a shopping mall',
  'an amusement park',
]

const cityOptions = [
  { label: 'New York City', value: 'new-york-city' },
  { label: 'Chicago', value: 'chicago' },
  { label: 'San Francisco', value: 'san-francisco' },
]

const distanceOptions = [
  { label: 'Within 1 mile', value: '1' },
  { label: 'Within 5 miles', value: '5' },
  { label: 'Within 10 miles', value: '10' },
  { label: 'Within 25 miles', value: '25' },
]

const priceOptions = [
  { label: '$', value: '1' },
  { label: '$$', value: '2' },
  { label: '$$$', value: '3' },
  { label: '$$$$', value: '4' },
]

const sortOptions = [
  { label: 'Price: low to high', value: 'price-asc' },
  { label: 'Price: high to low', value: 'price-desc' },
  { label: 'Distance: nearest', value: 'distance' },
  { label: 'Rating: highest', value: 'rating' },
]

const emptyFilters = {
  city: '',
  distance: '',
  price: '',
  sort: '',
}

const layoutTransition = {
  duration: 0.55,
  ease: [0.22, 1, 0.36, 1],
}

const sizeTransition =
  'height 0.55s cubic-bezier(0.22, 1, 0.36, 1), font-size 0.55s cubic-bezier(0.22, 1, 0.36, 1), padding 0.55s cubic-bezier(0.22, 1, 0.36, 1)'

const SearchResults = () => {
  const location = useLocation()

  const query = location.state?.query || ''
  const initialFilters = location.state?.filters || emptyFilters

  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState('signup')

  const openAuth = (mode) => {
    setAuthMode(mode)
    setAuthOpen(true)
  }

  const [search, setSearch] = useState(query)
  const [filters, setFilters] = useState(initialFilters)
  const [submittedQuery, setSubmittedQuery] = useState(query)
  const [view, setView] = useState('gallery')

  const [activity, setActivity] = useState('a beach')
  const [fade, setFade] = useState(true)

  useEffect(() => {
    let index = 0

    const interval = setInterval(() => {
      setFade(false)

      setTimeout(() => {
        index = (index + 1) % words.length
        setActivity(words[index])
        setFade(true)
      }, 500)
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const setFilter = (key) => (value) =>
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))

  const handleSearch = (e) => {
    e.preventDefault()

    const newQuery = search.trim()

    if (!newQuery) return

    setSubmittedQuery(newQuery)
  }

  return (
    <>
      <VStack align='stretch' gap={5}>
        <motion.div layout='position' transition={layoutTransition}>
          <form onSubmit={handleSearch}>
            <Stack direction={{ base: 'column', md: 'row' }} gap={3}>
              <Box position='relative' flex='1'>
                <Input
                  size='lg'
                  width='100%'
                  borderRadius='full'
                  px={5}
                  fontSize='md'
                  transition={sizeTransition}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />

                {search === '' && (
                  <Text
                    position='absolute'
                    left='20px'
                    top='50%'
                    transform='translateY(-50%)'
                    fontSize='md'
                    color='gray.500'
                    pointerEvents='none'
                  >
                    I am looking for{' '}
                    <Box
                      as='span'
                      opacity={fade ? 1 : 0}
                      transition='opacity 0.5s ease-in-out'
                    >
                      {activity}
                    </Box>
                  </Text>
                )}
              </Box>

              <Button
                type='submit'
                size='lg'
                px={7}
                fontSize='md'
                transition={sizeTransition}
              >
                Find Activities
              </Button>
            </Stack>
          </form>
        </motion.div>

        <motion.div layout='position' transition={layoutTransition}>
          <HStack gap={3} wrap='wrap'>
            <Text color='fg.muted' fontWeight='medium'>
              Filters:
            </Text>

            <FilterSelect
              label='City'
              options={cityOptions}
              value={filters.city}
              onChange={setFilter('city')}
            />

            <FilterSelect
              label='Distance'
              options={distanceOptions}
              value={filters.distance}
              onChange={setFilter('distance')}
            />

            <FilterSelect
              label='Price'
              options={priceOptions}
              value={filters.price}
              onChange={setFilter('price')}
              width='140px'
            />

            <FilterSelect
              label='Sort by'
              options={sortOptions}
              value={filters.sort}
              onChange={setFilter('sort')}
              width='210px'
            />
          </HStack>
        </motion.div>

        <EventResults
          query={submittedQuery}
          filters={filters}
          view={view}
          onViewChange={setView}
          onClearFilters={() => setFilters(emptyFilters)}
          onRequireAuth={() => openAuth('login')}
        />
      </VStack>

      <AuthModal
        open={authOpen}
        mode={authMode}
        onModeChange={setAuthMode}
        onClose={() => setAuthOpen(false)}
      />
    </>
  )
}

export default SearchResults
