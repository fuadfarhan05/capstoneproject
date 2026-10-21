import { Box, Flex, HStack, Heading, Text, Badge, Link } from '@chakra-ui/react'
import { MapPin, Ticket } from 'lucide-react'
import SaveButton from './SaveButton'
import {
  getCoverBackground,
  formatEventDate,
  formatPricing,
  formatCategory,
} from '../utils/eventDisplay'

// Event photo (or a gradient when there isn't one) with the category pill
const Cover = ({ event, onRequireAuth, ...props }) => (
  <Box
    position='relative'
    flexShrink={0}
    bg='bg.muted'
    style={{ background: getCoverBackground(event) }}
    {...props}
  >
    {event.category && event.category !== 'unknown' && (
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
        {formatCategory(event.category)}
      </Badge>
    )}
    <SaveButton
      event={event}
      onRequireAuth={onRequireAuth}
      position='absolute'
      top={2.5}
      right={2.5}
    />
  </Box>
)

const Meta = ({ event }) => (
  <HStack gap={4} justify='space-between' wrap='wrap'>
    <Text fontWeight='bold' fontSize='md'>
      {formatPricing(event)}
    </Text>
    {event.ticket_link && (
      <Link
        href={event.ticket_link}
        target='_blank'
        rel='noopener noreferrer'
        fontSize='sm'
        fontWeight='semibold'
        onClick={(e) => e.stopPropagation()}
      >
        <Ticket size={14} />
        Get tickets
      </Link>
    )}
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
    {formatEventDate(event.date)}
    {event.time && ` · ${event.time}`}
  </Text>
)

const Venue = ({ event }) => {
  // older saved events have `neighborhood`; API events have `city`
  const place = [event.venue, event.neighborhood ?? event.city]
    .filter(Boolean)
    .join(' · ')
  if (!place) return null
  return (
    <HStack gap={1.5} color='fg.muted' fontSize='sm' minW={0}>
      <MapPin size={14} style={{ flexShrink: 0 }} />
      <Text truncate title={event.address ?? undefined}>
        {place}
      </Text>
    </HStack>
  )
}

const cardStyles = {
  borderRadius: '2xl',
  borderWidth: '1px',
  bg: 'bg',
  overflow: 'hidden',
  cursor: 'pointer',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  _hover: { transform: 'translateY(-4px)', shadow: 'lg' },
}

const EventCard = ({ event, view, onRequireAuth }) => {
  if (view === 'list') {
    return (
      <Flex {...cardStyles} direction={{ base: 'column', sm: 'row' }}>
        <Cover
          event={event}
          onRequireAuth={onRequireAuth}
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
          {event.description && (
            <Text fontSize='sm' color='fg.muted' lineClamp={2}>
              {event.description}
            </Text>
          )}
          <Box mt='auto' pt={2}>
            <Meta event={event} />
          </Box>
        </Flex>
      </Flex>
    )
  }

  return (
    <Flex {...cardStyles} direction='column' h='100%'>
      <Cover
        event={event}
        onRequireAuth={onRequireAuth}
        aspectRatio={16 / 10}
      />
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
