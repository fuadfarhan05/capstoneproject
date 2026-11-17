import { useState } from 'react'
import {
  Button,
  ButtonGroup,
  Center,
  Heading,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Users } from 'lucide-react'
import { useAuth } from '../AuthContext'
import usePlans from '../context/usePlans'
import AuthModal from '../components/AuthModal'

// Opened from a trip's invite link: /plans/join/:planId?code=...
const JoinTrip = () => {
  const { planId } = useParams()
  const [searchParams] = useSearchParams()
  const code = searchParams.get('code') ?? ''
  const navigate = useNavigate()

  const { user, loading } = useAuth()
  const { plans, joinPlan } = usePlans()

  const [joining, setJoining] = useState(false)
  const [error, setError] = useState('')
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState('signup')

  const openTrip = () =>
    navigate('/plans', { replace: true, state: { openPlanId: planId } })

  const alreadyMember = plans.some((plan) => plan.id === planId)

  const handleJoin = async () => {
    setJoining(true)
    setError('')
    try {
      await joinPlan(planId, code)
      openTrip()
    } catch (err) {
      setError(
        err.code === 'permission-denied' || err.code === 'not-found'
          ? 'This invite link is invalid or the trip no longer exists.'
          : 'Could not join the trip. Please try again.',
      )
      setJoining(false)
    }
  }

  if (loading) {
    return (
      <Center pt='25vh'>
        <Spinner size='lg' />
      </Center>
    )
  }

  return (
    <VStack gap={4} pt={{ base: '10vh', md: '15vh' }} textAlign='center'>
      <Center boxSize={20} borderRadius='full' bg='blue.50' color='blue.600'>
        <Users size={36} />
      </Center>
      <Heading size='2xl'>You&apos;re invited to a trip</Heading>

      {!user ? (
        <>
          <Text color='fg.muted' maxW='md'>
            Log in or create an account to join and start planning together.
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
        </>
      ) : alreadyMember ? (
        <>
          <Text color='fg.muted'>You&apos;re already on this trip.</Text>
          <Button mt={2} onClick={openTrip}>
            Open trip
          </Button>
        </>
      ) : (
        <>
          <Text color='fg.muted' maxW='md'>
            Join to see the trip, add activities, and plan with everyone else.
          </Text>
          <Button mt={2} size='lg' loading={joining} onClick={handleJoin}>
            Join trip
          </Button>
          {error && <Text color='red.500'>{error}</Text>}
        </>
      )}
    </VStack>
  )
}

export default JoinTrip
