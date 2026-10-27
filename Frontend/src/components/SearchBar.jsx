import { Box, Input, Text } from '@chakra-ui/react'
import { useState, useEffect } from 'react'

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

const SearchBar = ({ width = '100%', color = 'white', value, onChange }) => {
  const [activity, setActivity] = useState('a beach')
  const [fade, setFade] = useState(true)

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

  return (
    <Box position='relative' flex='1' w={width} minW='0'>
      <Input
        size='2xl'
        w='100%'
        h={{ base: '60px', md: '72px' }}
        borderRadius='full'
        border='2px solid'
        borderColor='white'
        bg={color}
        boxShadow='0 8px 30px rgba(20,80,120,0.12)'
        px={7}
        fontSize={{ base: 'md', md: 'lg' }}
        color='#12304A'
        _placeholder={{ color: 'gray.500' }}
        _hover={{
          borderColor: '#D5EAFE',
        }}
        _focus={{
          borderColor: '#3182CE',
          boxShadow: '0 0 0 3px rgba(49,130,206,0.18)',
        }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label='Search for activities'
      />

      {value === '' && (
        <Text
          position='absolute'
          left='28px'
          right={4}
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
  )
}

export default SearchBar
