import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  VStack,
  Box,
  Heading,
  Text,
  Grid,
  GridItem,
  Input,
  Button,
  Dialog,
  SimpleGrid,
  CloseButton,
  Portal,
  Flex,
  HStack,
  Badge,
  Center,
  Spinner,
  ButtonGroup,
} from '@chakra-ui/react'
import { Users } from 'lucide-react'

import { Destinations, TravelDate, ReturnDate } from '../components/index'
import usePlans from '../context/usePlans'
import { useAuth } from '../AuthContext'
import AuthModal from '../components/AuthModal'
import TripMembers, { MemberAvatars } from '../components/TripMembers'

const formatActivityDate = (date) => {
  if (!date) return ''

  return String(date)
}

// Display dates as MM/DD/YYYY.
const formatPlanDate = (date) => {
  if (!date) return ''

  let year, month, day

  if (typeof date === 'string') {
    ;[year, month, day] = date.slice(0, 10).split('-')
  } else if (typeof date === 'object' && date.year) {
    year = date.year
    month = date.month
    day = date.day
  } else {
    return String(date)
  }

  return `${String(month).padStart(2, '0')}/${String(day).padStart(
    2,
    '0',
  )}/${year}`
}

// Keep dates stored as YYYY-MM-DD for the date picker.
const storePlanDate = (date) => {
  if (!date) return ''

  if (typeof date === 'string') {
    return date.slice(0, 10)
  }

  if (typeof date === 'object' && date.year) {
    const month = String(date.month).padStart(2, '0')
    const day = String(date.day).padStart(2, '0')

    return `${date.year}-${month}-${day}`
  }

  return String(date)
}

const Plans = () => {
  const { user, loading: authLoading } = useAuth()
  const {
    plans,
    loading: plansLoading,
    error: plansError,
    createPlan,
    updatePlan,
    deletePlan,
    leavePlan,
  } = usePlans()
  const location = useLocation()

  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [actionError, setActionError] = useState('')

  const [planName, setPlanName] = useState('')
  const [destination, setDestination] = useState('')
  const [travelDate, setTravelDate] = useState('')
  const [returnDate, setReturnDate] = useState('')

  // JoinTrip sends people here with the trip they just joined
  const [selectedPlanId, setSelectedPlanId] = useState(
    location.state?.openPlanId ?? null,
  )
  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId)

  const [edit, setEdit] = useState(false)
  const [editPlanName, setEditPlanName] = useState('')
  const [editDestination, setEditDestination] = useState('')
  const [editTravelDate, setEditTravelDate] = useState('')
  const [editReturnDate, setEditReturnDate] = useState('')

  // Create a new trip.
  const handleCreatePlan = async (e) => {
    e.preventDefault()

    if (!planName.trim() || !destination || !travelDate || !returnDate) {
      return
    }

    const newPlan = {
      name: planName.trim(),
      destination,
      travelDate: storePlanDate(travelDate),
      returnDate: storePlanDate(returnDate),
      activities: [],
    }

    setActionError('')
    try {
      await createPlan(newPlan)
    } catch {
      setActionError('Could not create the trip. Please try again.')
      return
    }

    setPlanName('')
    setDestination('')
    setTravelDate('')
    setReturnDate('')
  }

  // Enter edit mode.
  const handleEdit = () => {
    if (!selectedPlan) return

    setEditPlanName(selectedPlan.name)
    setEditDestination(selectedPlan.destination)
    setEditTravelDate(storePlanDate(selectedPlan.travelDate))
    setEditReturnDate(storePlanDate(selectedPlan.returnDate))

    setEdit(true)
  }

  // Save trip changes.
  const handleSave = () => {
    if (!selectedPlan || !editPlanName.trim()) return

    // the snapshot listener updates the UI; errors are logged by the provider
    updatePlan({
      ...selectedPlan,
      name: editPlanName.trim(),
      destination: editDestination,
      travelDate: storePlanDate(editTravelDate),
      returnDate: storePlanDate(editReturnDate),
    }).catch(() => {})

    setEdit(false)
  }

  // Delete an individual activity from the trip.
  const handleDeleteActivity = (activityId) => {
    if (!selectedPlan) return

    const updatedActivities = (selectedPlan.activities || []).filter(
      (activity, index) => String(activity.id ?? index) !== String(activityId),
    )

    updatePlan({
      ...selectedPlan,
      activities: updatedActivities,
    }).catch(() => {})
  }

  // Delete the entire trip from the details dialog.
  const handleDelete = () => {
    if (!selectedPlan) return

    deletePlan(selectedPlan.id).catch(() => {})
    setSelectedPlanId(null)
    setEdit(false)
  }

  // Non-organizers leave instead of deleting the trip for everyone
  const handleLeave = () => {
    if (!selectedPlan) return

    leavePlan(selectedPlan.id).catch(() => {})
    setSelectedPlanId(null)
    setEdit(false)
  }

  const isOwner = selectedPlan?.ownerId === user?.uid

  const closePlan = () => {
    setSelectedPlanId(null)
    setEdit(false)
  }

  if (authLoading) {
    return (
      <Center pt='25vh'>
        <Spinner size='lg' />
      </Center>
    )
  }

  // Trips are saved to your account so they can be shared with friends
  if (!user) {
    return (
      <VStack gap={4} pt={{ base: '10vh', md: '15vh' }} textAlign='center'>
        <Center boxSize={20} borderRadius='full' bg='bg.muted'>
          <Users size={36} />
        </Center>
        <Heading size='2xl'>Log in to plan trips</Heading>
        <Text color='fg.muted' maxW='md'>
          Create trips, add activities, and plan together with friends.
        </Text>
        <ButtonGroup mt={2}>
          <Button
            variant='outline'
            onClick={() => {
              setAuthMode('login')
              setAuthOpen(true)
            }}
          >
            Log in
          </Button>
          <Button
            onClick={() => {
              setAuthMode('signup')
              setAuthOpen(true)
            }}
          >
            Sign up
          </Button>
        </ButtonGroup>
        <AuthModal
          open={authOpen}
          mode={authMode}
          onModeChange={setAuthMode}
          onClose={() => setAuthOpen(false)}
        />
      </VStack>
    )
  }

  return (
    <>
      <VStack align='stretch' gap={6}>
        <Box>
          <Heading size={{ base: 'xl', md: '2xl' }}>Make a Plan</Heading>

          <Text color='gray.500'>
            Create your perfect trip with activities you love.
          </Text>
        </Box>

        {/* Create a trip */}
        <form onSubmit={handleCreatePlan}>
          <Grid
            spaceY={4}
            templateColumns={{
              base: '1fr',
              md: 'repeat(5, 1fr)',
            }}
            gap={6}
            alignItems='end'
          >
            <GridItem spaceY={2}>
              <Heading size='sm'>Trip Name</Heading>

              <Input
                placeholder='Example: Birthday Weekend'
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                borderRadius='full'
                bg='white'
              />
            </GridItem>

            <GridItem spaceY={2}>
              <Destinations value={destination} onChange={setDestination} />
            </GridItem>

            <GridItem spaceY={2}>
              <TravelDate value={travelDate} onChange={setTravelDate} />
            </GridItem>

            <GridItem spaceY={2}>
              <ReturnDate value={returnDate} onChange={setReturnDate} />
            </GridItem>

            <GridItem>
              <Button
                type='submit'
                w='full'
                bg='blue.700'
                color='white'
                _hover={{
                  bg: 'blue.600',
                  transform: 'translateY(-2px)',
                  boxShadow: 'md',
                }}
              >
                Create Plan
              </Button>
            </GridItem>
          </Grid>
        </form>

        {actionError && <Text color='red.500'>{actionError}</Text>}

        {/* Display trips */}
        <Box pt={4}>
          {plansLoading ? (
            <Center py={10}>
              <Spinner />
            </Center>
          ) : plansError ? (
            <Box
              borderWidth='1px'
              borderRadius='lg'
              p={8}
              textAlign='center'
              bg='white'
            >
              <Text color='red.500'>Could not load your trips.</Text>
              <Text color='gray.500' fontSize='sm' mt={1}>
                {plansError.code === 'permission-denied'
                  ? 'Firestore security rules are blocking trips. See firestore.rules in the repo.'
                  : 'Check your connection and refresh the page.'}
              </Text>
            </Box>
          ) : plans.length > 0 ? (
            <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} gap={6}>
              {plans.map((plan) => (
                <Box
                  bg={'white'}
                  w={300}
                  key={plan.id}
                  borderWidth='1px'
                  borderRadius='lg'
                  p={5}
                  cursor='pointer'
                  transition='all 0.2s'
                  _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: 'md',
                  }}
                  onClick={() => setSelectedPlanId(plan.id)}
                >
                  <VStack align='stretch' gap={3}>
                    <Heading size='md'>{plan.name}</Heading>

                    <Text>Destination: {plan.destination}</Text>

                    <Text>Travel Date: {formatPlanDate(plan.travelDate)}</Text>

                    <Text>Return Date: {formatPlanDate(plan.returnDate)}</Text>

                    <HStack justify='space-between'>
                      <Text fontSize='sm' color='gray.500'>
                        {plan.activities?.length || 0}{' '}
                        {(plan.activities?.length || 0) === 1
                          ? 'activity'
                          : 'activities'}
                      </Text>
                      <HStack gap={2}>
                        {(plan.memberIds?.length ?? 1) > 1 && (
                          <Badge borderRadius='full' colorPalette='blue'>
                            Shared
                          </Badge>
                        )}
                        <MemberAvatars plan={plan} />
                      </HStack>
                    </HStack>
                  </VStack>
                </Box>
              ))}
            </SimpleGrid>
          ) : (
            <Box
              borderWidth='1px'
              borderRadius='lg'
              p={8}
              textAlign='center'
              bg='white'
            >
              <Text color='gray.500'>Your plans will appear here.</Text>
            </Box>
          )}
        </Box>
      </VStack>

      {/* Trip details dialog */}
      <Dialog.Root
        open={selectedPlan !== undefined && selectedPlan !== null}
        onOpenChange={(e) => {
          if (!e.open) closePlan()
        }}
        placement='center'
        motionPreset='slide-in-bottom'
        scrollBehavior='inside'
      >
        <Portal>
          <Dialog.Backdrop />

          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                {edit ? (
                  <Input
                    placeholder='Trip name'
                    value={editPlanName}
                    onChange={(e) => setEditPlanName(e.target.value)}
                    borderRadius='full'
                    w={{ md: 250 }}
                  />
                ) : (
                  <Dialog.Title>{selectedPlan?.name}</Dialog.Title>
                )}
              </Dialog.Header>

              <Dialog.Body>
                {selectedPlan && (
                  <VStack align='stretch' gap={5}>
                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={5}>
                      <Box>
                        <Text fontSize='sm' fontWeight='medium'>
                          Destination
                        </Text>

                        {edit ? (
                          <Destinations
                            value={editDestination}
                            onChange={setEditDestination}
                            edit={edit}
                          />
                        ) : (
                          <Text color='gray.500'>
                            {selectedPlan.destination}
                          </Text>
                        )}
                      </Box>

                      <Box>
                        <Text fontSize='sm' fontWeight='medium'>
                          Travel Date
                        </Text>

                        {edit ? (
                          <TravelDate
                            value={editTravelDate}
                            onChange={setEditTravelDate}
                            edit={edit}
                          />
                        ) : (
                          <Text color='gray.500'>
                            {formatPlanDate(selectedPlan.travelDate)}
                          </Text>
                        )}
                      </Box>

                      <Box>
                        <Text fontSize='sm' fontWeight='medium'>
                          Return Date
                        </Text>

                        {edit ? (
                          <ReturnDate
                            value={editReturnDate}
                            onChange={setEditReturnDate}
                            edit={edit}
                          />
                        ) : (
                          <Text color='gray.500'>
                            {formatPlanDate(selectedPlan.returnDate)}
                          </Text>
                        )}
                      </Box>
                    </SimpleGrid>

                    {/* Friends on this trip + sharing */}
                    <Box borderWidth='1px' borderRadius='lg' p={4}>
                      <TripMembers plan={selectedPlan} />
                    </Box>

                    {/* Activities */}
                    <Box>
                      <Text fontSize='sm' fontWeight='medium' mb={3}>
                        Activities
                      </Text>

                      {selectedPlan.activities?.length > 0 ? (
                        <VStack align='stretch' gap={3}>
                          {selectedPlan.activities.map((activity, index) => (
                            <Flex
                              key={activity.id ?? index}
                              justify='space-between'
                              align='center'
                              borderWidth='1px'
                              borderRadius='md'
                              p={3}
                              gap={3}
                            >
                              <Box flex='1'>
                                <Text fontWeight='semibold'>
                                  {activity.title}
                                </Text>

                                {activity.venue && (
                                  <Text fontSize='sm' color='gray.500'>
                                    {activity.venue}
                                  </Text>
                                )}

                                {activity.date && (
                                  <Text fontSize='sm' color='gray.500'>
                                    {formatActivityDate(activity.date)}
                                  </Text>
                                )}
                              </Box>

                              {edit && (
                                <Button
                                  size='sm'
                                  colorPalette='red'
                                  variant='outline'
                                  onClick={() =>
                                    handleDeleteActivity(activity.id ?? index)
                                  }
                                >
                                  Delete
                                </Button>
                              )}
                            </Flex>
                          ))}
                        </VStack>
                      ) : (
                        <Box
                          borderWidth='1px'
                          borderRadius='md'
                          p={5}
                          textAlign='center'
                        >
                          <Text color='gray.500'>No activities added yet.</Text>

                          <Text color='gray.400' fontSize='sm' mt={1}>
                            Activities you add to this trip will appear here.
                          </Text>
                        </Box>
                      )}
                    </Box>
                  </VStack>
                )}
              </Dialog.Body>

              <Dialog.Footer>
                {!edit ? (
                  <Button variant='outline' onClick={handleEdit}>
                    Edit
                  </Button>
                ) : (
                  <Button variant='outline' onClick={handleSave}>
                    Save
                  </Button>
                )}

                {!edit && isOwner && (
                  <Button
                    colorPalette='red'
                    variant='outline'
                    onClick={handleDelete}
                  >
                    Delete
                  </Button>
                )}

                {!edit && !isOwner && (
                  <Button
                    colorPalette='red'
                    variant='outline'
                    onClick={handleLeave}
                  >
                    Leave trip
                  </Button>
                )}

                <Button variant='outline' onClick={closePlan}>
                  Close
                </Button>
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

export default Plans
