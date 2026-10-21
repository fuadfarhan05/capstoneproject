import {
  Flex,
  Heading,
  Input,
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
import FilterSelect from '../components/FilterSelect'
import {
  cityOptions,
  categoryOptions,
  sortOptions,
  emptyFilters,
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

const NotLoggedHome = () => {
  const navigate = useNavigate()

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
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))

  const handleSearch = () => {
    navigate('/search', {
      state: {
        query: search,
        filters: filters,
      },
    })
  }

  return (
    <Box minH='100vh' px={{ base: 4, md: 12, lg: 20 }} pb={16}>
      <Box
        position='absolute'
        top={4}
        right={{ base: 4, md: 12, lg: 20 }}
        zIndex={1}
      >
        <AccountButtons onOpenAuth={openAuth} />
      </Box>

      <VStack align='stretch' gap={8} pt={{ base: '20vh', md: '25vh' }}>
        <Flex justify='center' minH={10}>
          <Heading size={{ base: '4xl', md: '7xl' }}>Triply</Heading>
        </Flex>

        <form onSubmit={handleSearch}>
          <Stack direction={{ base: 'column', md: 'row' }} gap={3}>
            <Box position='relative' flex='1'>
              <Input
                size='2xl'
                width='100%'
                borderRadius='full'
                px={6}
                fontSize='lg'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label='Search for activities'
              />

              {search === '' && (
                <Text
                  position='absolute'
                  left='24px'
                  top='50%'
                  transform='translateY(-50%)'
                  fontSize='lg'
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

            <Button type='submit' size='2xl' px={10} fontSize='lg'>
              Find Activities
            </Button>
          </Stack>
        </form>

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
            label='Category'
            options={categoryOptions}
            value={filters.category}
            onChange={setFilter('category')}
            width='200px'
          />

          <FilterSelect
            label='Sort by'
            options={sortOptions}
            value={filters.sort}
            onChange={setFilter('sort')}
            width='210px'
          />
        </HStack>
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
