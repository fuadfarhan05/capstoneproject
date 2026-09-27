import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'

const config = defineConfig({
  theme: {
    recipes: {
      // make every button pill-shaped
      button: {
        base: {
          borderRadius: 'full',
        },
      },
    },
  },
})

export const system = createSystem(defaultConfig, config)
