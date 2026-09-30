import { Box, Center, Menu } from '@chakra-ui/react'
import { CiMenuBurger } from 'react-icons/ci'
const Nav = () => {
  return (
    <Box>
      <Center>
        <Menu.Root>
          <Menu.Trigger asChild>
            <CiMenuBurger />
          </Menu.Trigger>
        </Menu.Root>
      </Center>
    </Box>
  )
}
export default Nav
