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

const SearchBar = ({ width, color, value, onChange }) => {
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

  return (
    <Box position='relative' flex='1' w={width}>
      <Input
        size='2xl'
        width='100%'
        borderRadius='full'
        px={6}
        fontSize='lg'
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label='Search for activities'
        bgColor={color}
      />

      {value === '' && (
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
  )
}

export default SearchBar
