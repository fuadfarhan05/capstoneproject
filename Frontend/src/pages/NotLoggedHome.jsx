import {
  Center,
  Heading,
  Input,
  Stack,
  Button,
  VStack,
  ButtonGroup,
  Box,
  Text,
  Portal,
  Select,
  createListCollection,
} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
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
const locations = createListCollection({
  items: [
    { label: 'New York City', value: 'New York City' },
    { label: 'Chicago', value: 'Chicago' },
    { label: 'San Francisco', value: 'San Francisco' },
  ],
})

const NotLoggedHome = () => {
  const navigate = useNavigate()

  const [activity, setActivity] = useState('a beach')
  const [fade, setFade] = useState(true)

  useEffect(() => {
    let index = 0

    const interval = setInterval(() => {
      // Fade out
      setFade(false)

      setTimeout(() => {
        // Change the word
        index = (index + 1) % words.length
        setActivity(words[index])

        // Fade back in
        setFade(true)
      }, 500)
    }, 2000)

    return () => clearInterval(interval)
  }, [])
  const [search, setSearch] = useState('')
  return (
    <Center>
      <Box width='100%'>
        <ButtonGroup
          mt={{ md: 2 }}
          mr={{ md: 4 }}
          display='flex'
          justifyContent='flex-end'
        >
          <Button onClick={() => navigate('/login')}>Login</Button>
          <Button variant='surface' onClick={() => navigate('/signup')}>
            Sign up
          </Button>
        </ButtonGroup>
        <VStack mt={{ md: '25vh' }}>
          <Heading size={{ md: '7xl' }}>Capstone Project</Heading>
          <Stack spaceY='2'>
            <Box position='relative' width={{ md: 550 }}>
              <Input
                width='100%'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search === '' && (
                <Text
                  position='absolute'
                  left='12px'
                  top='50%'
                  transform='translateY(-50%)'
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
            <Select.Root collection={locations} size='sm' width='320px'>
              <Select.HiddenSelect />
              <Select.Label>Select a city</Select.Label>
              <Select.Control>
                <Select.Trigger>
                  <Select.ValueText placeholder='Select a city' />
                </Select.Trigger>
                <Select.IndicatorGroup>
                  <Select.Indicator />
                </Select.IndicatorGroup>
              </Select.Control>
              <Portal>
                <Select.Positioner>
                  <Select.Content>
                    {locations.items.map((framework) => (
                      <Select.Item item={framework} key={framework.value}>
                        {framework.label}
                        <Select.ItemIndicator />
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Positioner>
              </Portal>
            </Select.Root>
            <Button width={{ md: 100 }}>Find Activities</Button>
          </Stack>
        </VStack>
      </Box>
    </Center>
  )
}
export default NotLoggedHome
