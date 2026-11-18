import { useState } from 'react'
import {
  Avatar,
  AvatarGroup,
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Input,
  Text,
  VStack,
} from '@chakra-ui/react'
import { Check, Copy, Link2, UserPlus, X } from 'lucide-react'
import { useAuth } from '../AuthContext'
import usePlans from '../context/usePlans'

const memberList = (plan) =>
  (plan.memberIds ?? []).map(
    (uid) => plan.members?.[uid] ?? { uid, email: 'Unknown member' },
  )

const memberName = (member) =>
  member.displayName || member.email?.split('@')[0] || 'Traveler'

const MemberAvatar = ({ member, size = 'sm' }) => (
  <Avatar.Root size={size}>
    <Avatar.Fallback name={memberName(member)} />
    {member.photoURL && <Avatar.Image src={member.photoURL} />}
  </Avatar.Root>
)

// Compact stack of member avatars for trip cards
export const MemberAvatars = ({ plan, max = 4 }) => {
  const members = memberList(plan)
  const extra = members.length - max
  return (
    <AvatarGroup size='xs' stacking='first-on-top'>
      {members.slice(0, max).map((member) => (
        <MemberAvatar key={member.uid} member={member} size='xs' />
      ))}
      {extra > 0 && (
        <Avatar.Root size='xs' variant='solid'>
          <Avatar.Fallback>+{extra}</Avatar.Fallback>
        </Avatar.Root>
      )}
    </AvatarGroup>
  )
}

const addFriendMessages = {
  added: { text: 'Added to the trip!', ok: true },
  'already-member': { text: "They're already on this trip.", ok: true },
  self: { text: "That's you, you're already on this trip.", ok: true },
  'not-found': {
    text: 'No Triply account uses that email. Send them the invite link below instead.',
    ok: false,
  },
}

const AddFriendForm = ({ plan }) => {
  const { addFriendByEmail } = usePlans()
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setBusy(true)
    setMessage(null)
    try {
      const result = await addFriendByEmail(plan.id, email)
      setMessage(addFriendMessages[result])
      if (result === 'added') setEmail('')
    } catch {
      setMessage({ text: 'Could not add them. Please try again.', ok: false })
    } finally {
      setBusy(false)
    }
  }

  return (
    <Box as='form' onSubmit={handleSubmit}>
      <HStack gap={2}>
        <Input
          type='email'
          placeholder="Friend's email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setMessage(null)
          }}
          borderRadius='full'
          aria-label="Friend's email"
        />
        <Button type='submit' loading={busy} flexShrink={0}>
          <UserPlus size={16} />
          Add
        </Button>
      </HStack>
      {message && (
        <Text fontSize='sm' mt={2} color={message.ok ? 'green.600' : 'red.500'}>
          {message.text}
        </Text>
      )}
    </Box>
  )
}

const InviteLink = ({ plan }) => {
  const { getInviteLink } = usePlans()
  const [copied, setCopied] = useState(false)
  const link = getInviteLink(plan)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard blocked; the link is still selectable in the input
    }
  }

  return (
    <Box>
      <HStack gap={1.5} mb={1.5} color='fg.muted' fontSize='sm'>
        <Link2 size={14} />
        <Text>Anyone with this link can join after logging in</Text>
      </HStack>
      <HStack gap={2}>
        <Input
          value={link}
          readOnly
          onFocus={(e) => e.target.select()}
          borderRadius='full'
          fontSize='sm'
          aria-label='Invite link'
        />
        <Button variant='outline' onClick={copy} flexShrink={0}>
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </HStack>
    </Box>
  )
}

// "Who's going" section of the trip details dialog
const TripMembers = ({ plan }) => {
  const { user } = useAuth()
  const { removeMember } = usePlans()
  const isOwner = plan.ownerId === user?.uid

  return (
    <VStack align='stretch' gap={4}>
      <Text fontSize='sm' fontWeight='medium'>
        Who&apos;s going ({plan.memberIds?.length ?? 1})
      </Text>

      <VStack align='stretch' gap={2}>
        {memberList(plan).map((member) => {
          const isMe = member.uid === user?.uid
          return (
            <Flex key={member.uid} align='center' gap={3}>
              <MemberAvatar member={member} />
              <Box flex='1' minW={0}>
                <Text fontWeight='medium' truncate>
                  {memberName(member)}
                  {isMe && (
                    <Text as='span' color='fg.muted' fontWeight='normal'>
                      {' '}
                      (you)
                    </Text>
                  )}
                </Text>
                <Text fontSize='sm' color='fg.muted' truncate>
                  {member.email}
                </Text>
              </Box>
              {member.uid === plan.ownerId && (
                <Badge borderRadius='full' variant='subtle'>
                  Organizer
                </Badge>
              )}
              {isOwner && !isMe && (
                <IconButton
                  aria-label={`Remove ${memberName(member)}`}
                  size='xs'
                  variant='ghost'
                  onClick={() =>
                    removeMember(plan.id, member.uid).catch(() => {})
                  }
                >
                  <X size={14} />
                </IconButton>
              )}
            </Flex>
          )
        })}
      </VStack>

      <AddFriendForm plan={plan} />
      <InviteLink plan={plan} />
    </VStack>
  )
}

export default TripMembers
