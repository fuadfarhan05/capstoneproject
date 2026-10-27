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
} from '@chakra-ui/react'
import { useState } from 'react'
import { Destinations, TravelDate, ReturnDate } from '../components/index'

const Plans = () => {
  const [plans, setPlans] = useState([])
  const [planName, setPlanName] = useState('')
  const [destination, setDestination] = useState('')
  const [travelDate, setTravelDate] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [edit, setEdit] = useState(false)
  const [editPlanName, setEditPlanName] = useState('')
  const [editDestination, setEditDestination] = useState('')
  const [editTravelDate, setEditTravelDate] = useState('')
  const [editReturnDate, setEditReturnDate] = useState('')

  const createPlan = () => {
    if (!planName.trim() || !destination || !travelDate || !returnDate) {
      return
    }

    const newPlan = {
      id: Date.now(),
      name: planName.trim(),
      destination,
      travelDate,
      returnDate,
      friends: [],
      activities: [],
    }

    setPlans((currentPlans) => [...currentPlans, newPlan])

    setPlanName('')
    setDestination('')
    setTravelDate('')
    setReturnDate('')
  }

  const handleEdit = () => {
    setEditPlanName(selectedPlan.name)
    setEditDestination(selectedPlan.destination)
    setEditTravelDate(selectedPlan.travelDate)
    setEditReturnDate(selectedPlan.returnDate)
    setEdit(true)
  }

  const handleSave = () => {
    setPlans((currentPlans) =>
      currentPlans.map((plan) =>
        plan.id === selectedPlan.id
          ? {
              ...plan,
              name: editPlanName.trim(),
              destination: editDestination,
              travelDate: editTravelDate,
              returnDate: editReturnDate,
            }
          : plan
      )
    )

    setSelectedPlan((currentPlan) => ({
      ...currentPlan,
      name: editPlanName.trim(),
      destination: editDestination,
      travelDate: editTravelDate,
      returnDate: editReturnDate,
    }))

    setEdit(false)
  }

  const handleDelete = () => {
    setPlans((currentPlans) =>
      currentPlans.filter((plan) => plan.id !== selectedPlan.id)
    )
    setSelectedPlan(null)
    setEdit(false)
  }

  return (
    <>
      <VStack align={'stretch'}>
        {/* Heading */}
        <Box>
          <Heading size={{ base: 'xl', md: '2xl' }}>Make a Plan</Heading>
          <Text color='grey'>
            Create your perfect trip with activies you love.
          </Text>
        </Box>

        {/* Search bar */}
        <form>
          <Grid
            spaceY={4}
            templateColumns='repeat(5, 1fr)'
            gap='6'
            alignItems='end'
          >
            <GridItem colSpan={1} spaceY={2}>
              <Heading>Trip Name </Heading>
              <Input
                placeholder='Example: Birthday Weekend'
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                borderRadius={'full'}
              />
            </GridItem>

            <GridItem colSpan={1} spaceY={2}>
              <Destinations value={destination} onChange={setDestination} />
            </GridItem>

            <GridItem colSpan={1} spaceY={2}>
              <TravelDate value={travelDate} onChange={setTravelDate} />
            </GridItem>

            <GridItem colSpan={1} spaceY={2}>
              <ReturnDate value={returnDate} onChange={setReturnDate} />
            </GridItem>

            <GridItem colSpan={1} spaceY={2}>
              <Button
                width={{ md: 100 }}
                onClick={createPlan}
                bg={'blue.700'}
                _hover={{
                  bg: 'blue.100',
                  transform: 'translateY(-2px)',
                  boxShadow: 'md',
                  color: 'black',
                }}
              >
                Create Plan
              </Button>
            </GridItem>
          </Grid>
        </form>
        <Box pt={6}>
          {plans.length > 0 ? (
            <SimpleGrid columns={{ base: 2, md: 4 }} gap={6}>
              {plans.map((plan) => (
                <Box
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
                  onClick={() => setSelectedPlan(plan)}
                  w={300}
                >
                  <VStack align='stretch' gap={3}>
                    <Heading size='md'>{plan.name}</Heading>
                    <Text>Destination: {plan.destination}</Text>
                    <Text>Travel Date: {String(plan.travelDate)}</Text>
                    <Text>Return Date: {String(plan.returnDate)}</Text>
                  </VStack>
                </Box>
              ))}
            </SimpleGrid>
          ) : (
            <Box borderWidth='1px' borderRadius='lg' p={8} textAlign='center'>
              <Text color='gray.500'>Your plans will appear here.</Text>
            </Box>
          )}
        </Box>
      </VStack>

      <Dialog.Root
        open={selectedPlan !== null}
        onOpenChange={(e) => {
          if (!e.open) {
            setSelectedPlan(null)
          }
        }}
      >
        <Dialog.Backdrop />

        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              {edit ? (
                <Input
                  placeholder={`${planName}`}
                  value={editPlanName}
                  onChange={(e) => setEditPlanName(e.target.value)}
                  borderRadius={'full'}
                  w={{ md: 250 }}
                />
              ) : (
                <Dialog.Title>{selectedPlan?.name}</Dialog.Title>
              )}
            </Dialog.Header>

            <Dialog.Body>
              {selectedPlan && (
                <VStack align='stretch' gap={5}>
                  <SimpleGrid columns={{ base: 2, md: 2 }} gap={5}>
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
                        <Text color='gray.500'>{selectedPlan.destination}</Text>
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
                          {String(selectedPlan.travelDate)}
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
                          {String(selectedPlan.returnDate)}
                        </Text>
                      )}
                    </Box>

                    <Box>
                      <Text fontSize='sm' fontWeight='medium'>
                        Friends
                      </Text>
                      <Text color='gray.500'>
                        {String(selectedPlan.friends)}
                      </Text>
                    </Box>
                  </SimpleGrid>

                  <Box>
                    <Text fontSize='sm' fontWeight='medium' mb={3}>
                      Activities
                    </Text>

                    <Box
                      borderWidth='1px'
                      borderRadius='md'
                      p={5}
                      textAlign='center'
                    >
                      <Text color='gray.500'>No activities added yet.</Text>

                      <Text color='gray.400' fontSize='sm' mt={1}>
                        Activities will appear here.
                      </Text>
                    </Box>
                  </Box>
                </VStack>
              )}
            </Dialog.Body>

            <Dialog.Footer>
              {edit === false ? (
                <Button variant='outline' onClick={handleEdit}>
                  Edit
                </Button>
              ) : (
                <Button variant='outline' onClick={handleSave}>
                  Save
                </Button>
              )}
              {!edit && (
                <Button variant='outline' onClick={handleDelete}>
                  Delete
                </Button>
              )}
              {edit === false && (
                <Button variant='outline' onClick={() => setSelectedPlan(null)}>
                  Add Friends
                </Button>
              )}
              <Button
                variant='outline'
                onClick={() => {
                  setEdit(false), setSelectedPlan(null)
                }}
              >
                Close
              </Button>
            </Dialog.Footer>

            <Dialog.CloseTrigger />
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </>
  )
}
export default Plans
