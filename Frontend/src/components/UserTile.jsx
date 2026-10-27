import { Box, Flex, Text } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

const UserTile = ({ user }) => {
  const navigate = useNavigate()

  return (
    <Flex
      w='100%'
      minW='275px'
      boxSizing='border-box'
      px={3}
      py={2}
      alignItems='center'
      textAlign='left'
      cursor='pointer'
      onClick={() => navigate('/profile')}
      _hover={{
        bg: 'blue.100',
        transform: 'translateY(-2px)',
        boxShadow: 'md',
      }}
    >
      <Box>
        <Text fontSize='lg' fontWeight='bold' overflowWrap='anywhere'>
          {user.displayName || 'User'}
        </Text>

        <Text fontSize='sm' mt={1} overflowWrap='anywhere'>
          {user.email}
        </Text>
      </Box>

      <Box ml='auto' flexShrink={0}>
        <ChevronRight />
      </Box>
    </Flex>
  )
}

export default UserTile
