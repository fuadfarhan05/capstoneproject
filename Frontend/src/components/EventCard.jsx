import { Box, Flex, HStack, Heading, Text, Badge } from '@chakra-ui/react'
import { MapPin, Star, Navigation } from 'lucide-react'

const formatPrice = (price) => (price === 0 ? 'Free' : `$${price}`)

// Image placeholder: a gradient with the category pill on top
const Cover = ({ event, ...props }) => (
  <Box
    position='relative'
    flexShrink={0}
    style={{ background: event.gradient }}
    {...props}
  >
    <Badge
      position='absolute'
      top={3}
      left={3}
      borderRadius='full'
      px={3}
      py={1}
      bg='whiteAlpha.900'
      color='gray.900'
      fontWeight='semibold'
      fontSize='xs'
    >
      {event.category}
    </Badge>
  </Box>
)

const Meta = ({ event }) => (
  <HStack gap={4} fontSize='sm' color='fg.muted' wrap='wrap'>
    <Text fontWeight='bold' fontSize='md' color='fg'>
      {formatPrice(event.price)}
    </Text>
    <HStack gap={1}>
      <Navigation size={14} />
      <Text>{event.distance} mi</Text>
    </HStack>
    <HStack gap={1}>
      <Star size={14} fill='currentColor' color='#f59e0b' />
      <Text color='fg' fontWeight='medium'>
        {event.rating}
      </Text>
      <Text>({event.reviews.toLocaleString()})</Text>
    </HStack>
  </HStack>
)

const Eyebrow = ({ event }) => (
  <Text
    fontSize='xs'
    fontWeight='semibold'
    letterSpacing='wider'
    textTransform='uppercase'
    color='fg.muted'
  >
    {event.date} · {event.time}
  </Text>
)

const Venue = ({ event }) => (
  <HStack gap={1.5} color='fg.muted' fontSize='sm' minW={0}>
    <MapPin size={14} style={{ flexShrink: 0 }} />
    <Text truncate>
      {event.venue} · {event.neighborhood}
    </Text>
  </HStack>
)

const cardStyles = {
  borderRadius: '2xl',
  borderWidth: '1px',
  bg: 'bg',
  overflow: 'hidden',
  cursor: 'pointer',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  _hover: { transform: 'translateY(-4px)', shadow: 'lg' },
}

const EventCard = ({ event, view }) => {
  if (view === 'list') {
    return (
      <Flex {...cardStyles} direction={{ base: 'column', sm: 'row' }}>
        <Cover
          event={event}
          w={{ base: '100%', sm: '220px', md: '280px' }}
          h={{ base: '160px', sm: 'auto' }}
          minH={{ sm: '170px' }}
        />
        <Flex direction='column' gap={2} p={5} flex='1' minW={0}>
          <Eyebrow event={event} />
          <Heading size='xl' lineHeight='short' lineClamp={2}>
            {event.title}
          </Heading>
          <Venue event={event} />
          <Text fontSize='sm' color='fg.muted' lineClamp={2}>
            {event.description}
          </Text>
          <Box mt='auto' pt={2}>
            <Meta event={event} />
          </Box>
        </Flex>
      </Flex>
    )
  }

  return (
    <Flex {...cardStyles} direction='column' h='100%'>
      <Cover event={event} aspectRatio={16 / 10} />
      <Flex direction='column' gap={2} p={5} flex='1'>
        <Eyebrow event={event} />
        <Heading size='lg' lineHeight='short' lineClamp={2}>
          {event.title}
        </Heading>
        <Venue event={event} />
        <Box mt='auto' pt={3}>
          <Meta event={event} />
        </Box>
      </Flex>
    </Flex>
  )
}

export default EventCard
