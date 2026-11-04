import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Flex,
  HStack,
  Heading,
  Text,
  Badge,
  Link,
  Button,
  Dialog,
  Portal,
  CloseButton,
} from '@chakra-ui/react'
import {
  MapPin,
  Ticket,
  BookmarkCheck,
  X,
  ArrowRight,
  CalendarDays,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import SaveButton from './SaveButton'
import usePlans from '../context/usePlans'
import {
  getCoverBackground,
  formatEventDate,
  formatEventTime,
  formatPricing,
  formatCategory,
} from '../utils/eventDisplay'

const MotionBox = motion.create(Box)

const Cover = ({ event, onRequireAuth, onSaved, ...props }) => (
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
      onSaved={onSaved}
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
    {event.time && ` · ${formatEventTime(event.time)}`}
  </Text>
)

const Venue = ({ event }) => {
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
  const navigate = useNavigate()
  const { plans, addActivityToPlan } = usePlans()

  const [showSavedPopup, setShowSavedPopup] = useState(false)
  const [showTripDialog, setShowTripDialog] = useState(false)
  const [selectedTripId, setSelectedTripId] = useState(null)
  const [addedToTrip, setAddedToTrip] = useState(false)

  const handleSaved = () => {
    setAddedToTrip(false)
    setShowSavedPopup(true)
  }

  const closePopup = () => {
    setShowSavedPopup(false)
  }

  const openTripDialog = () => {
    setShowSavedPopup(false)
    setSelectedTripId(null)
    setShowTripDialog(true)
  }

  const closeTripDialog = () => {
    setShowTripDialog(false)
    setSelectedTripId(null)
  }

  const handleAddToTrip = () => {
    if (!selectedTripId) return

    addActivityToPlan(selectedTripId, event)

    setShowTripDialog(false)
    setSelectedTripId(null)
    setAddedToTrip(true)
    setShowSavedPopup(true)
  }

  const viewSavedActivities = () => {
    setShowSavedPopup(false)
    navigate('/saved-activities')
  }

  useEffect(() => {
    if (!showSavedPopup) return

    const timer = setTimeout(() => {
      setShowSavedPopup(false)
      setAddedToTrip(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [showSavedPopup])

  return (
    <>
      {view === 'list' ? (
        <Flex {...cardStyles} direction={{ base: 'column', sm: 'row' }}>
          <Cover
            event={event}
            onRequireAuth={onRequireAuth}
            onSaved={handleSaved}
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
      ) : (
        <Flex {...cardStyles} direction='column' h='100%'>
          <Cover
            event={event}
            onRequireAuth={onRequireAuth}
            onSaved={handleSaved}
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
      )}

      {/* Bottom-right notification */}
      <AnimatePresence>
        {showSavedPopup && (
          <MotionBox
            position='fixed'
            bottom={6}
            right={6}
            zIndex={9999}
            maxW='340px'
            w='calc(100% - 32px)'
            bg='bg.panel'
            borderWidth='1px'
            borderRadius='xl'
            shadow='2xl'
            p={4}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.25 }}
          >
            <HStack justify='space-between' align='start'>
              <HStack gap={3}>
                <Box bg='green.100' color='green.700' p={2} borderRadius='full'>
                  <BookmarkCheck size={20} />
                </Box>

                <Box>
                  <Text fontWeight='bold'>
                    {addedToTrip
                      ? 'Added to planned trip!'
                      : 'Added to saved activities!'}
                  </Text>

                  <Text fontSize='sm' color='fg.muted'>
                    {addedToTrip
                      ? 'Your activity was added to your trip.'
                      : 'Your activity has been saved.'}
                  </Text>
                </Box>
              </HStack>

              <Button
                variant='ghost'
                size='xs'
                minW='auto'
                p={1}
                onClick={closePopup}
                aria-label='Close notification'
              >
                <X size={16} />
              </Button>
            </HStack>

            {!addedToTrip && (
              <Button
                mt={3}
                w='100%'
                size='sm'
                variant='outline'
                onClick={openTripDialog}
              >
                <CalendarDays size={16} />
                Add to planned trip
              </Button>
            )}

            <Button
              mt={2}
              w='100%'
              size='sm'
              colorPalette='blue'
              onClick={viewSavedActivities}
            >
              View saved activities
              <ArrowRight size={16} />
            </Button>
          </MotionBox>
        )}
      </AnimatePresence>

      {/* Separate planned-trip overlay */}
      <Dialog.Root
        open={showTripDialog}
        onOpenChange={(e) => {
          if (!e.open) closeTripDialog()
        }}
        placement='center'
        motionPreset='slide-in-bottom'
      >
        <Portal>
          <Dialog.Backdrop />

          <Dialog.Positioner>
            <Dialog.Content
              borderRadius='2xl'
              mx={4}
              bg='gray.100'
              maxW='450px'
            >
              <Dialog.Header>
                <Dialog.Title>Add to planned trip</Dialog.Title>
              </Dialog.Header>

              <Dialog.Body>
                <Text color='gray.600' fontSize='sm' mb={4}>
                  Choose which trip you want to add this activity to.
                </Text>

                {plans.length > 0 ? (
                  <Flex direction='column' gap={3}>
                    {plans.map((plan) => (
                      <Box
                        key={plan.id}
                        p={3}
                        borderWidth='2px'
                        borderRadius='lg'
                        bg='white'
                        borderColor={
                          selectedTripId === plan.id ? 'blue.500' : 'gray.200'
                        }
                        cursor='pointer'
                        onClick={() => setSelectedTripId(plan.id)}
                      >
                        <HStack justify='space-between'>
                          <Box>
                            <Text fontWeight='bold'>{plan.name}</Text>
                            <Text fontSize='sm' color='gray.600'>
                              {plan.destination}
                            </Text>
                            <Text fontSize='xs' color='gray.500'>
                              {String(plan.travelDate)} –{' '}
                              {String(plan.returnDate)}
                            </Text>
                          </Box>

                          <Box
                            borderRadius='full'
                            borderWidth='2px'
                            borderColor={
                              selectedTripId === plan.id
                                ? 'blue.500'
                                : 'gray.300'
                            }
                            bg={
                              selectedTripId === plan.id
                                ? 'blue.500'
                                : 'transparent'
                            }
                            w='20px'
                            h='20px'
                          />
                        </HStack>
                      </Box>
                    ))}
                  </Flex>
                ) : (
                  <Box bg='white' borderRadius='lg' p={5} textAlign='center'>
                    <CalendarDays size={28} />
                    <Text fontWeight='semibold' mt={2}>
                      No planned trips yet
                    </Text>
                    <Text color='gray.500' fontSize='sm' mt={1}>
                      Create a trip first, then you can add this activity.
                    </Text>
                  </Box>
                )}
              </Dialog.Body>

              <Dialog.Footer>
                <Button variant='outline' onClick={closeTripDialog}>
                  Cancel
                </Button>

                {plans.length > 0 && (
                  <Button
                    bg='#2879CF'
                    color='white'
                    disabled={!selectedTripId}
                    onClick={handleAddToTrip}
                    _hover={{ bg: '#1E65B0' }}
                  >
                    Add activity
                  </Button>
                )}

                {plans.length === 0 && (
                  <Button
                    bg='#2879CF'
                    color='white'
                    onClick={() => {
                      closeTripDialog()
                      navigate('/plans')
                    }}
                  >
                    Create a trip
                  </Button>
                )}
              </Dialog.Footer>

              <Dialog.CloseTrigger asChild>
                <CloseButton size='sm' />
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  )
}

export default EventCard
