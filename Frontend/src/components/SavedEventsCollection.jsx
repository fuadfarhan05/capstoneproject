import { useState } from 'react'
import {
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Text,
  VStack,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'motion/react'
import { Bookmark, ChevronDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useSavedEvents } from '../SavedEventsContext'
import EventCard from './EventCard'

// Overlapping gradient thumbnails of the first few saved events,
// like the cover of a playlist/collection
const CollectionCover = ({ events }) => {
  const previews = events.slice(0, 3)
  if (previews.length === 0) {
    return (
      <Center boxSize={14} borderRadius='xl' bg='bg.muted' flexShrink={0}>
        <Bookmark size={22} />
      </Center>
    )
  }
  return (
    <Box
      position='relative'
      w={`${56 + (previews.length - 1) * 14}px`}
      h={14}
      flexShrink={0}
    >
      {previews.map((event, i) => (
        <Box
          key={event.id}
          position='absolute'
          left={`${i * 14}px`}
          boxSize={14}
          borderRadius='xl'
          borderWidth='2px'
          borderColor='bg'
          shadow='sm'
          zIndex={previews.length - i}
          style={{ background: event.gradient }}
        />
      ))}
    </Box>
  )
}

const SavedEventsCollection = () => {
  const navigate = useNavigate()
  const { savedEvents } = useSavedEvents()
  const [open, setOpen] = useState(false)
  const count = savedEvents.length

  return (
    <VStack align='stretch' gap={6} w='100%'>
      <Flex
        as='button'
        type='button'
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        align='center'
        gap={4}
        p={4}
        pr={5}
        w='100%'
        maxW='md'
        mx='auto'
        borderWidth='1px'
        borderRadius='2xl'
        bg='bg'
        textAlign='left'
        cursor='pointer'
        transition='box-shadow 0.2s, transform 0.2s'
        _hover={{ shadow: 'md', transform: 'translateY(-2px)' }}
        _focusVisible={{ outline: '2px solid', outlineOffset: '2px' }}
      >
        <CollectionCover events={savedEvents} />
        <Box flex='1' minW={0}>
          <Heading size='md'>Your saved events</Heading>
          <Text color='fg.muted' fontSize='sm'>
            {count} {count === 1 ? 'event' : 'events'}
          </Text>
        </Box>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          style={{ display: 'inline-flex' }}
        >
          <ChevronDown size={20} />
        </motion.span>
      </Flex>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key='saved-events'
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            // padding keeps card hover shadows from being clipped
            style={{ overflow: 'hidden', padding: '4px' }}
          >
            {count === 0 ? (
              <VStack py={10} gap={3} textAlign='center'>
                <Text color='fg.muted'>
                  Tap the bookmark on any event to save it here.
                </Text>
                <Button onClick={() => navigate('/search')}>
                  Explore activities
                </Button>
              </VStack>
            ) : (
              <Box
                display='grid'
                gridTemplateColumns='repeat(auto-fill, minmax(min(100%, 280px), 1fr))'
                gap={6}
                textAlign='left'
              >
                <AnimatePresence mode='popLayout'>
                  {savedEvents.map((event) => (
                    <motion.div
                      key={event.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{
                        opacity: 0,
                        scale: 0.9,
                        transition: { duration: 0.2 },
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <EventCard event={event} view='gallery' />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </Box>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </VStack>
  )
}

export default SavedEventsCollection
