import {
  Flex,
  Heading,
  Stack,
  Button,
  VStack,
  Box,
  Text,
  HStack,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthModal from '../components/AuthModal'
import AccountButtons from '../components/AccountButtons'
import Filter from '../components/Filter'
import { SearchBar } from '../components/index'
import {
  categoryOptions,
  cityOptions,
  emptyFilters,
  sortOptions,
} from '../data/filterOptions'

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

const LandingPage = () => {  // Collects a search and supported filters before opening the results page.
  const navigate = useNavigate()

  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState('signup')
  const [activity, setActivity] = useState('a beach')
  const [fade, setFade] = useState(true)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState(emptyFilters)

  const openAuth = (mode) => {
    setAuthMode(mode)
    setAuthOpen(true)
  }

  useEffect(() => {
    let index = 0
    let timeout

    const interval = setInterval(() => {
      setFade(false)

      timeout = setTimeout(() => {
        index = (index + 1) % words.length
        setActivity(words[index])
        setFade(true)
      }, 500)
    }, 2500)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [])

  const setFilter = (key) => (value) =>  // Updates one filter without clearing the others.
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))

  const handleSearch = (e) => {  // Preserves the search and filters while navigating to results.
    e.preventDefault()

    navigate('/results', {
      state: {
        query: search,
        filters,
      },
    })
  }

  return (
    <Box
      minH='100vh'
      position='relative'
      overflow='hidden'
      bg='#EAF9FF'
      color='#12304A'
    >
      {/* Background image */}
      <Box
        position='absolute'
        inset={0}
        zIndex={0}
        backgroundImage="url('/images/triply-background.png')"
        backgroundSize='cover'
        backgroundPosition='center bottom'
        backgroundRepeat='no-repeat'
      />

      {/* Background overlay */}
      <Box
        position='absolute'
        inset={0}
        zIndex={0}
        bg='linear-gradient(to bottom, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.12) 45%, rgba(255,255,255,0.02) 100%)'
        pointerEvents='none'
      />

      {/* Login and sign-up buttons */}
      <Box
        position='absolute'
        top={5}
        right={{ base: 4, md: 12, lg: 20 }}
        zIndex={2}
      >
        <AccountButtons onOpenAuth={openAuth} />
      </Box>

      {/* Main landing page content */}
      <VStack
        position='relative'
        zIndex={1}
        align='stretch'
        gap={{ base: 7, md: 9 }}
        px={{ base: 4, md: 12, lg: 20 }}
        pt={{ base: '25vh', md: '23vh' }}
        pb={20}
      >
        {/* Branding */}
        <Flex
          justify='center'
          align='center'
          direction='column'
          textAlign='center'
          gap={3}
          spaceY={6}
        >
          <Heading
            fontSize={{ base: '5xl', md: '7xl' }}
            fontWeight='extrabold'
            letterSpacing='-0.04em'
            color='#12304A'
          >
            Triply
          </Heading>

          <Text
            fontSize={{ base: 'md', md: 'xl' }}
            fontWeight='medium'
            color='#294B63'
            maxW='600px'
          >
            Making finding fun on vacation easier than ever.
          </Text>
        </Flex>

        {/* Search bar */}
        <Box maxW='1000px' width='100%' mx='auto'>
          <form onSubmit={handleSearch}>
            <Stack direction={{ base: 'column', md: 'row' }} align='stretch'>
              <Box position='relative' flex='1'>
                <SearchBar
                  width='800px'
                  color='white'
                  value={search}
                  onChange={setSearch}
                />

                {search === '' && (
                  <Text
                    position='absolute'
                    left='28px'
                    right='4'
                    top='50%'
                    transform='translateY(-50%)'
                    fontSize={{ base: 'sm', md: 'lg' }}
                    color='gray.500'
                    pointerEvents='none'
                    whiteSpace='nowrap'
                    overflow='hidden'
                  >
                    I am looking for{' '}
                    <Box
                      as='span'
                      display='inline'
                      color='#2879CF'
                      fontWeight='bold'
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
            </Stack>
          </form>
        </Box>

        {/* Filters - using the same Filter component as Results */}
        <HStack
          justify='center'
          align='center'
          gap={3}
          wrap='wrap'
          maxW='1000px'
          width='100%'
          mx='auto'
          p={{ base: 3, md: 4 }}
          borderRadius='2xl'
          backdropFilter='blur(8px)'
        >
          <Text color='#294B63' fontWeight='bold' mr={1}>
            Filters:
          </Text>

          <Filter
            filter='city'
            value={filters.city}
            options={cityOptions}
            onChange={setFilter('city')}
          />

          <Filter
            filter='category'
            value={filters.category}
            options={categoryOptions}
            placeholder='Category'
            onChange={setFilter('category')}
          />

          <Filter
            filter='sort'
            value={filters.sort}
            options={sortOptions}
            onChange={setFilter('sort')}
          />
        </HStack>
      </VStack>

      {/* Authentication modal */}
      <AuthModal
        open={authOpen}
        mode={authMode}
        onModeChange={setAuthMode}
        onClose={() => setAuthOpen(false)}
      />
    </Box>
  )
}

export default LandingPage
