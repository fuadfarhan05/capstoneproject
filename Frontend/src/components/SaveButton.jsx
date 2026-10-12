import { IconButton } from '@chakra-ui/react'
import { Bookmark } from 'lucide-react'
import { motion } from 'motion/react'
import { useAuth } from '../AuthContext'
import { useSavedEvents } from '../SavedEventsContext'

// onRequireAuth is called instead of saving when nobody is logged in,
// so the page can open its login modal
const SaveButton = ({ event, onRequireAuth, ...props }) => {
  const { user } = useAuth()
  const { isSaved, toggleSave } = useSavedEvents()
  const saved = isSaved(event.id)

  return (
    <IconButton
      aria-label={saved ? 'Remove from saved' : 'Save event'}
      aria-pressed={saved}
      size='sm'
      bg='whiteAlpha.900'
      color='gray.900'
      shadow='sm'
      _hover={{ bg: 'white', transform: 'scale(1.08)' }}
      transition='transform 0.15s ease, background 0.15s ease'
      onClick={(e) => {
        // the card itself will be clickable later; don't trigger it
        e.stopPropagation()
        if (!user) {
          onRequireAuth?.()
          return
        }
        toggleSave(event)
      }}
      {...props}
    >
      {/* key on `saved` so the icon pops each time it's toggled */}
      <motion.span
        key={String(saved)}
        initial={{ scale: 0.6 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 18 }}
        style={{ display: 'inline-flex' }}
      >
        <Bookmark size={16} fill={saved ? 'currentColor' : 'none'} />
      </motion.span>
    </IconButton>
  )
}

export default SaveButton
