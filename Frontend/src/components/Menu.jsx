import { useState } from 'react'
import { Drawer, VStack, Image, IconButton, Button } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import menuImage from '../assets/menuImage.png'

const Menu = () => {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Menu image button */}
      <IconButton
        variant='ghost'
        onClick={() => setOpen(true)}
        aria-label='Open menu'
      >
        <Image src={menuImage} alt='Menu' boxSize='32px' />
      </IconButton>

      {/* Menu drawer */}
      <Drawer.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
        <Drawer.Backdrop />

        <Drawer.Positioner>
          <Drawer.Content>
            <Drawer.Header>
              <Drawer.Title>Menu</Drawer.Title>
            </Drawer.Header>

            <Drawer.Body>
              <VStack align='stretch' gap={4}>
                <Button
                  variant='ghost'
                  justifyContent='flex-start'
                  onClick={() => {
                    setOpen(false)
                    navigate('/')
                  }}
                >
                  Home
                </Button>

                <Button
                  variant='ghost'
                  justifyContent='flex-start'
                  onClick={() => {
                    setOpen(false)
                    navigate('/search')
                  }}
                >
                  Explore Activities
                </Button>

                <Button
                  variant='ghost'
                  justifyContent='flex-start'
                  onClick={() => setOpen(false)}
                >
                  Saved Activities
                </Button>

                <Button
                  variant='ghost'
                  justifyContent='flex-start'
                  onClick={() => {
                    setOpen(false)
                    navigate('/group-plans')
                  }}
                >
                  Group Plans
                </Button>
                <Button
                  variant='ghost'
                  justifyContent='flex-start'
                  onClick={() => setOpen(false)}
                >
                  Profile
                </Button>
              </VStack>
            </Drawer.Body>

            <Drawer.Footer>
              <Button variant='outline' onClick={() => setOpen(false)}>
                Close
              </Button>
            </Drawer.Footer>
          </Drawer.Content>
        </Drawer.Positioner>
      </Drawer.Root>
    </>
  )
}

export default Menu
