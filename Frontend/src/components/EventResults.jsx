import { useMemo, useState, useEffect } from 'react'
import {
  Box,
  Flex,
  HStack,
  Heading,
  Text,
  Button,
  VStack,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'motion/react'
import { LayoutList, LayoutGrid, SearchX } from 'lucide-react'
import EventCard from './EventCard'
import { mockEvents } from '../data/mockEvents'
import { useAuth } from '../AuthContext'
import { saveEvent, unsaveEvent, getSavedEvents } from '../savedEvents'

const sorters = {
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  distance: (a, b) => a.distance - b.distance,
  rating: (a, b) => b.rating - a.rating,
}

const applyFilters = (events, { city, distance, price, sort }) => {
  const result = events.filter(
    (e) =>
      (!city || e.city === city) &&
      (!distance || e.distance <= Number(distance)) &&
      (!price || e.priceLevel === Number(price)),
  )
  return sort ? [...result].sort(sorters[sort]) : result
}

const ViewToggle = ({ view, onChange }) => (
  <HStack gap={1} p={1} bg='bg.muted' borderRadius='full'>
    {[
      { value: 'list', label: 'List', Icon: LayoutList },
      { value: 'gallery', label: 'Gallery', Icon: LayoutGrid },
    ].map(({ value, label, Icon }) => (
      <Button
        key={value}
        size='sm'
        variant={view === value ? 'solid' : 'ghost'}
        onClick={() => onChange(value)}
        aria-pressed={view === value}
      >
        <Icon size={16} />
        {label}
      </Button>
    ))}
  </HStack>
)

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

const EventResults = ({
  query,
  filters,
  view,
  onViewChange,
  onClearFilters,
  onRequireAuth,
}) => {
  const { user } = useAuth()
  const [savedIds, setSavedIds] = useState(new Set())

  useEffect(() => {
    if (!user) {
      setSavedIds(new Set())
      return
    }
    getSavedEvents().then((events) => {
      setSavedIds(new Set(events.map((e) => e.id)))
    })
  }, [user])

  const toggleSave = async (event) => {
    if (!user) {
      onRequireAuth()
      return
    }
    const isSaved = savedIds.has(event.id)
    if (isSaved) {
      await unsaveEvent(event.id)
      setSavedIds((prev) => {
        const next = new Set(prev)
        next.delete(event.id)
        return next
      })
    } else {
      await saveEvent(event)
      setSavedIds((prev) => new Set(prev).add(event.id))
    }
  }

  const events = useMemo(() => applyFilters(mockEvents, filters), [filters])

  return (
    <Box width='100%'>
      <Flex
        justify='space-between'
        align={{ base: 'flex-start', sm: 'flex-end' }}
        direction={{ base: 'column', sm: 'row' }}
        gap={3}
        mb={6}
      >
        <Box>
          <Heading size='2xl' letterSpacing='tight'>
            {query ? `Things to do near "${query}"` : 'Popular activities'}
          </Heading>
          <Text color='fg.muted' mt={1}>
            {events.length} {events.length === 1 ? 'activity' : 'activities'}{' '}
            found
          </Text>
        </Box>
        <ViewToggle view={view} onChange={onViewChange} />
      </Flex>

      {events.length === 0 ? (
        <VStack py={16} gap={3} color='fg.muted'>
          <SearchX size={40} />
          <Heading size='md' color='fg'>
            No activities match these filters
          </Heading>
          <Button variant='outline' size='sm' onClick={onClearFilters}>
            Clear filters
          </Button>
        </VStack>
      ) : (
        <AnimatePresence mode='wait'>
          <motion.div
            key={view + JSON.stringify(filters)}
            variants={container}
            initial='hidden'
            animate='show'
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            style={
              view === 'gallery'
                ? {
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
                    gap: '24px',
                  }
                : { display: 'flex', flexDirection: 'column', gap: '16px' }
            }
          >
            {events.map((event) => (
              <motion.div key={event.id} variants={item}>
                <EventCard
                  event={event}
                  view={view}
                  isSaved={savedIds.has(event.id)}
                  onToggleSave={() => toggleSave(event)}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </Box>
  )
}

export default EventResults