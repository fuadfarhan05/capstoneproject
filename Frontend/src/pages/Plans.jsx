import { useState } from 'react'
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
} from '@chakra-ui/react'

import { Destinations, TravelDate, ReturnDate } from '../components/index'
import usePlans from '../context/usePlans'

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
    '0'
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
  const { plans, createPlan, updatePlan, deletePlan } = usePlans()

  const [planName, setPlanName] = useState('')
  const [destination, setDestination] = useState('')
  const [travelDate, setTravelDate] = useState('')
  const [returnDate, setReturnDate] = useState('')

  const [selectedPlanId, setSelectedPlanId] = useState(null)
  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId)

  const [edit, setEdit] = useState(false)
  const [editPlanName, setEditPlanName] = useState('')
  const [editDestination, setEditDestination] = useState('')
  const [editTravelDate, setEditTravelDate] = useState('')
  const [editReturnDate, setEditReturnDate] = useState('')

  // Create a new trip.
  const handleCreatePlan = (e) => {
    e.preventDefault()

    if (!planName.trim() || !destination || !travelDate || !returnDate) {
      return
    }

    const newPlan = {
      id: Date.now(),
      name: planName.trim(),
      destination,
      travelDate: storePlanDate(travelDate),
      returnDate: storePlanDate(returnDate),
      friends: [],
      activities: [],
    }

    createPlan(newPlan)

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

    updatePlan({
      ...selectedPlan,
      name: editPlanName.trim(),
      destination: editDestination,
      travelDate: storePlanDate(editTravelDate),
      returnDate: storePlanDate(editReturnDate),
    })

    setEdit(false)
  }

  // Delete an individual activity from the trip.
  const handleDeleteActivity = (activityId) => {
    if (!selectedPlan) return

    const updatedActivities = (selectedPlan.activities || []).filter(
      (activity, index) => String(activity.id ?? index) !== String(activityId)
    )

    updatePlan({
      ...selectedPlan,
      activities: updatedActivities,
    })
  }

  // Delete the entire trip from the details dialog.
  const handleDelete = () => {
    if (!selectedPlan) return

    deletePlan(selectedPlan.id)
    setSelectedPlanId(null)
    setEdit(false)
  }

  const closePlan = () => {
    setSelectedPlanId(null)
    setEdit(false)
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

        {/* Display trips */}
        <Box pt={4}>
          {plans.length > 0 ? (
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

                    <Text fontSize='sm' color='gray.500'>
                      {plan.activities?.length || 0}{' '}
                      {(plan.activities?.length || 0) === 1
                        ? 'activity'
                        : 'activities'}
                    </Text>
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

                      <Box>
                        <Text fontSize='sm' fontWeight='medium'>
                          Friends
                        </Text>

                        <Text color='gray.500'>
                          {selectedPlan.friends?.length
                            ? selectedPlan.friends.join(', ')
                            : 'No friends added'}
                        </Text>
                      </Box>
                    </SimpleGrid>

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

                {!edit && (
                  <Button
                    colorPalette='red'
                    variant='outline'
                    onClick={handleDelete}
                  >
                    Delete
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
