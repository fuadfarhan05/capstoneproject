import {
  Box,
  Button,
  Dialog,
  Field,
  Flex,
  Heading,
  Input,
  NativeSelect,
  SimpleGrid,
  Text,
  VStack,
} from '@chakra-ui/react'
import { useState } from 'react'

const locations = ['New York City', 'Chicago', 'San Francisco']

const GroupPlans = () => {
  const [plans, setPlans] = useState([])
  const [selectedPlan, setSelectedPlan] = useState(null)

  const [planName, setPlanName] = useState('')
  const [destination, setDestination] = useState('')
  const [date, setDate] = useState('')

  const createPlan = () => {
    if (!planName.trim() || !destination || !date) {
      return
    }

    const newPlan = {
      id: Date.now(),
      name: planName.trim(),
      destination,
      date,
      activities: [],
    }

    setPlans((currentPlans) => [...currentPlans, newPlan])

    setPlanName('')
    setDestination('')
    setDate('')
  }

  return (
    <>
      <VStack align='stretch' gap={5}>
        {/* Header */}
        <Box>
          <Heading size={{ base: 'xl', md: '2xl' }}>Group Plans</Heading>

          <Text color='gray.500' mt={1}>
            Plan activities and trips with your friends.
          </Text>
        </Box>

        {/* Make Plan */}
        <Box>
          <Heading size='md' mb={3}>
            Make a Plan
          </Heading>

          <Flex
            direction={{ base: 'column', md: 'row' }}
            gap={3}
            align={{ base: 'stretch', md: 'end' }}
          >
            <Field.Root flex='1'>
              <Field.Label>Trip Name</Field.Label>

              <Input
                placeholder='Example: NYC Weekend'
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                borderRadius={'full'}
              />
            </Field.Root>

            <Field.Root flex='1'>
              <Field.Label>Destination</Field.Label>

              <NativeSelect.Root>
                <NativeSelect.Field
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  borderRadius={'full'}
                >
                  <option value=''>Select a destination</option>

                  {locations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </NativeSelect.Field>
              </NativeSelect.Root>
            </Field.Root>

            <Field.Root flex='1'>
              <Field.Label>Date</Field.Label>

              <Input
                type='date'
                value={date}
                onChange={(e) => setDate(e.target.value)}
                borderRadius={'full'}
              />
            </Field.Root>

            <Button onClick={createPlan}>Create Plan</Button>
          </Flex>
        </Box>

        {/* Plans */}
        <Box>
          <Heading size='md' mb={3}>
            Your Plans
          </Heading>

          {plans.length > 0 ? (
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={5}>
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
                >
                  <VStack align='stretch' gap={3}>
                    <Box>
                      <Heading size='md'>{plan.name}</Heading>

                      <Text color='gray.500' mt={1}>
                        {plan.destination}
                      </Text>
                    </Box>

                    <Text fontSize='sm'>{plan.date}</Text>

                    <Box>
                      <Text fontSize='sm' fontWeight='medium'>
                        Activities
                      </Text>

                      <Text fontSize='sm' color='gray.500'>
                        {plan.activities.length === 0
                          ? 'No activities added yet'
                          : `${plan.activities.length} activities`}
                      </Text>
                    </Box>
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

      {/* Plan Details Overlay */}
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
              <Dialog.Title>{selectedPlan?.name}</Dialog.Title>
            </Dialog.Header>

            <Dialog.Body>
              {selectedPlan && (
                <VStack align='stretch' gap={5}>
                  <Box>
                    <Text fontSize='sm' fontWeight='medium'>
                      Destination
                    </Text>

                    <Text color='gray.500'>{selectedPlan.destination}</Text>
                  </Box>

                  <Box>
                    <Text fontSize='sm' fontWeight='medium'>
                      Date
                    </Text>

                    <Text color='gray.500'>{selectedPlan.date}</Text>
                  </Box>

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
              <Button variant='outline' onClick={() => setSelectedPlan(null)}>
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

export default GroupPlans
