import {
  Stack,
  Button,
  VStack,
  Box,
  Text,
  HStack,
  Heading,
} from '@chakra-ui/react'
import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import AuthModal from '../components/AuthModal'
import Filter from '../components/Filter'
import EventResults from '../components/EventResults'
import { motion } from 'motion/react'
import { MainBg, NewYorkBg, ChicagoBg, SanFrancisco } from '../assets/index'
import { MapPin } from 'lucide-react'
import { SearchBar } from '../components/index'

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

const Results = () => {
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
  const [pin, setPin] = useState('')
  const [back, setBack] = useState(MainBg)

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

  const pinVal = (city) => {
    if (city === 'new-york-city') {
      setPin('New York City')
      setBack(NewYorkBg)
    } else if (city === 'chicago') {
      setPin('Chicago')
      setBack(ChicagoBg)
    } else if (city === 'san-francisco') {
      setPin('San Francisco')
      setBack(SanFrancisco)
    }
  }
  return (
    <>
      <VStack align='stretch' gap={5} bg='#EAF9FF'>
        <motion.div layout='position' transition={layoutTransition}>
          <form onSubmit={handleSearch}>
            <Box
              position='relative'
              backgroundImage={`url(${back})`}
              backgroundSize='cover'
              backgroundPosition='center'
              backgroundRepeat='no-repeat'
              borderRadius='xl'
              overflow='hidden'
              p={6}
              minH='300px'
            >
              <Stack direction={{ base: 'column', md: 'row' }} gap={3}>
                <Box position='relative' flex='1'>
                  <HStack gap={2} mb={4}>
                    <MapPin
                      color='white'
                      style={{ filter: 'drop-shadow(2px 2px 2px black)' }}
                    />
                    <Text color='white' textShadow='2px 2px 2px black'>
                      {pin}
                    </Text>
                  </HStack>
                  <Box pb={8} spaceY={4}>
                    <Heading
                      color='white'
                      fontSize='5xl'
                      textShadow='2px 2px 2px black'
                    >
                      Discover Amazing
                    </Heading>

                    <Heading
                      color='white'
                      fontSize='5xl'
                      ml={8}
                      textShadow='2px 2px 2px black'
                    >
                      Activities
                    </Heading>
                  </Box>
                  <HStack gap={3} width='fit-content' align='center'>
                    <SearchBar
                      width='600px'
                      color='white'
                      value={search}
                      onChange={setSearch}
                    />

                    <Button
                      type='submit'
                      h={{ base: '56px', md: '72px' }}
                      px={{ base: 8, md: 10 }}
                      borderRadius='full'
                      fontSize='lg'
                      fontWeight='bold'
                      bg='#2879CF'
                      color='white'
                      boxShadow='0 8px 20px rgba(40,121,207,0.25)'
                      _hover={{
                        bg: '#1E65B0',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 10px 24px rgba(40,121,207,0.32)',
                      }}
                      transition='all 0.2s'
                    >
                      Find Activities
                    </Button>
                  </HStack>
                </Box>
              </Stack>
            </Box>
          </form>
        </motion.div>

        <motion.div layout='position' transition={layoutTransition}>
          <HStack gap={3} wrap='wrap'>
            <Text color='fg.muted' fontWeight='medium'>
              Filters:
            </Text>

            <Filter
              filter='city'
              onChange={(value) => {
                setFilter('city')(value)
                pinVal(value)
              }}
            />

            <Filter filter='distance' onChange={setFilter('distance')} />

            <Filter filter='price' onChange={setFilter('price')} />

            <Filter filter='sort' onChange={setFilter('sort')} />
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

export default Results
