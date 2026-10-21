import { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Flex,
  HStack,
  Heading,
  Text,
  Button,
  VStack,
  Skeleton,
  SkeletonText,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'motion/react'
import { LayoutList, LayoutGrid, SearchX, CloudOff } from 'lucide-react'
import EventCard from './EventCard'
import { fetchEvents } from '../api/events'
import { getMinPrice } from '../utils/eventDisplay'
import { cityOptions } from '../data/filterOptions'

// Events with no known price/date go last whichever way we sort
const byNumber = (getValue, direction) => (a, b) => {
  const [x, y] = [getValue(a), getValue(b)]
  if (x === null) return y === null ? 0 : 1
  if (y === null) return -1
  return direction * (x - y)
}
const dateValue = (e) => (e.date ? Date.parse(e.date) || null : null)

const sorters = {
  date: byNumber(dateValue, 1),
  'price-asc': byNumber(getMinPrice, 1),
  'price-desc': byNumber(getMinPrice, -1),
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

const layoutStyle = (view) =>
  view === 'gallery'
    ? {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
        gap: '24px',
      }
    : { display: 'flex', flexDirection: 'column', gap: '16px' }

// Placeholder cards shaped like the real ones while events load
const LoadingCards = ({ view }) => (
  <Box style={layoutStyle(view)} aria-busy='true' aria-label='Loading events'>
    {Array.from({ length: 6 }, (_, i) => (
      <Flex
        key={i}
        direction={view === 'list' ? { base: 'column', sm: 'row' } : 'column'}
        borderWidth='1px'
        borderRadius='2xl'
        overflow='hidden'
      >
        <Skeleton
          {...(view === 'list'
            ? { w: { base: '100%', sm: '280px' }, h: '170px' }
            : { aspectRatio: 16 / 10 })}
          borderRadius={0}
        />
        <VStack align='stretch' gap={3} p={5} flex='1'>
          <Skeleton h='3' w='35%' />
          <Skeleton h='5' w='85%' />
          <SkeletonText noOfLines={2} gap={2} />
        </VStack>
      </Flex>
    ))}
  </Box>
)

const Message = ({ icon: Icon, title, children }) => (
  <VStack py={16} gap={3} color='fg.muted' textAlign='center'>
    <Icon size={40} />
    <Heading size='md' color='fg'>
      {title}
    </Heading>
    {children}
  </VStack>
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
  const { city, category, sort } = filters
  const [retryCount, setRetryCount] = useState(0)

  // Which request the current state belongs to. When the search or filters
  // change, the key changes and we're "loading" until the new result lands.
  const requestKey = JSON.stringify([query, city, category, retryCount])
  const [result, setResult] = useState({ key: null, events: [], error: null })
  const loading = result.key !== requestKey

  useEffect(() => {
    const controller = new AbortController()
    fetchEvents({ city, category, query }, { signal: controller.signal })
      .then((events) => setResult({ key: requestKey, events, error: null }))
      .catch((err) => {
        if (err.name === 'AbortError') return // a newer request replaced it
        console.error('Could not load events:', err)
        setResult({ key: requestKey, events: [], error: err.message })
      })
    return () => controller.abort()
  }, [city, category, query, requestKey])

  const events = useMemo(
    () =>
      sort && sorters[sort]
        ? [...result.events].sort(sorters[sort])
        : result.events,
    [result.events, sort],
  )

  const cityLabel = cityOptions.find((o) => o.value === city)?.label ?? city
  const heading = query
    ? `Results for “${query}”`
    : cityLabel
      ? `Things to do in ${cityLabel}`
      : 'Popular activities'
  const hasFilters = Boolean(city || category || sort)

  let body
  if (loading) {
    body = <LoadingCards view={view} />
  } else if (result.error) {
    body = (
      <Message icon={CloudOff} title="Couldn't load activities">
        <Text maxW='md'>{result.error}</Text>
        <Button
          variant='outline'
          size='sm'
          onClick={() => setRetryCount((n) => n + 1)}
        >
          Try again
        </Button>
      </Message>
    )
  } else if (events.length === 0) {
    body = (
      <Message
        icon={SearchX}
        title={
          hasFilters
            ? 'No activities match these filters'
            : 'No activities found'
        }
      >
        {hasFilters && (
          <Button variant='outline' size='sm' onClick={onClearFilters}>
            Clear filters
          </Button>
        )}
      </Message>
    )
  } else {
    body = (
      <AnimatePresence mode='wait'>
        <motion.div
          key={view + requestKey}
          variants={container}
          initial='hidden'
          animate='show'
          exit={{ opacity: 0, transition: { duration: 0.15 } }}
          style={layoutStyle(view)}
        >
          {events.map((event) => (
            <motion.div key={event.id} variants={item} layout='position'>
              <EventCard
                event={event}
                view={view}
                onRequireAuth={onRequireAuth}
              />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    )
  }

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
            {heading}
          </Heading>
          <Text color='fg.muted' mt={1}>
            {loading
              ? 'Searching…'
              : result.error
                ? ' '
                : `${events.length} ${events.length === 1 ? 'activity' : 'activities'} found`}
          </Text>
        </Box>
        <ViewToggle view={view} onChange={onViewChange} />
      </Flex>
      {body}
    </Box>
  )
}

export default EventResults
