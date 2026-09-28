import {
  Flex,
  Heading,
  Input,
  Stack,
  Button,
  VStack,
  ButtonGroup,
  Box,
  Text,
  HStack,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import AuthModal from '../components/AuthModal'
import FilterSelect from '../components/FilterSelect'
import EventResults from '../components/EventResults'
import { motion, AnimatePresence } from 'motion/react'
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

const layoutTransition = { duration: 0.55, ease: [0.22, 1, 0.36, 1] }
const sizeTransition =
  'height 0.55s cubic-bezier(0.22, 1, 0.36, 1), font-size 0.55s cubic-bezier(0.22, 1, 0.36, 1), padding 0.55s cubic-bezier(0.22, 1, 0.36, 1)'

const emptyFilters = { city: '', distance: '', price: '', sort: '' }

const NotLoggedHome = () => {
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState('signup')

  const openAuth = (mode) => {
    setAuthMode(mode)
    setAuthOpen(true)
  }

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
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState(emptyFilters)

  const setFilter = (key) => (value) =>
    setFilters((prev) => ({ ...prev, [key]: value }))
  const hasFilters = Object.values(filters).some(Boolean)

  const [submittedQuery, setSubmittedQuery] = useState(null)
  const [view, setView] = useState('gallery')
  const searched = submittedQuery !== null

  const handleSearch = (e) => {
    e.preventDefault()
    setSubmittedQuery(search.trim())
  }

  const resetSearch = () => {
    setSubmittedQuery(null)
    setSearch('')
  }

  return (
    <Box minH='100vh' px={{ base: 4, md: 12, lg: 20 }} pb={16}>
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

      <VStack
        align='stretch'
        gap={searched ? 5 : 8}
        pt={searched ? 5 : { base: '20vh', md: '25vh' }}
      >
        <Flex
          justify={searched ? 'flex-start' : 'center'}
          minH={10}
          pr={searched ? { base: '170px', md: 0 } : 0}
        >
          <Heading
            asChild
            size={
              searched ? { base: 'xl', md: '2xl' } : { base: '4xl', md: '7xl' }
            }
            cursor={searched ? 'pointer' : 'default'}
            onClick={searched ? resetSearch : undefined}
          >
            <motion.h1 layout transition={layoutTransition}>
              Capstone Project
            </motion.h1>
          </Heading>
        </Flex>

        <motion.div layout='position' transition={layoutTransition}>
          <form onSubmit={handleSearch}>
            <Stack direction={{ base: 'column', md: 'row' }} gap={3}>
              <Box position='relative' flex='1'>
                <Input
                  size={searched ? 'lg' : '2xl'}
                  width='100%'
                  borderRadius='full'
                  px={searched ? 5 : 6}
                  fontSize={searched ? 'md' : 'lg'}
                  transition={sizeTransition}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label='Search for activities'
                />
                {search === '' && (
                  <Text
                    position='absolute'
                    left={searched ? '20px' : '24px'}
                    top='50%'
                    transform='translateY(-50%)'
                    fontSize={searched ? 'md' : 'lg'}
                    transition={sizeTransition}
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
                size={searched ? 'lg' : '2xl'}
                px={searched ? 7 : 10}
                fontSize={searched ? 'md' : 'lg'}
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
            {hasFilters && (
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setFilters(emptyFilters)}
              >
                Clear all
              </Button>
            )}
          </HStack>
        </motion.div>

        <AnimatePresence>
          {searched && (
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 32, transition: { duration: 0.2 } }}
              transition={{ duration: 0.5, delay: 0.25, ease: 'easeOut' }}
              style={{ marginTop: 16 }}
            >
              <EventResults
                query={submittedQuery}
                filters={filters}
                view={view}
                onViewChange={setView}
                onClearFilters={() => setFilters(emptyFilters)}
                onRequireAuth={() => openAuth('login')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </VStack>

      <AuthModal
        open={authOpen}
        mode={authMode}
        onModeChange={setAuthMode}
        onClose={() => setAuthOpen(false)}
      />
    </Box>
  )
}
export default NotLoggedHome