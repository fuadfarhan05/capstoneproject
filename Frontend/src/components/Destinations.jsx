import { Select, createListCollection, Portal, Heading } from '@chakra-ui/react'

const location = createListCollection({
  items: [
    { label: 'New York', value: 'New York' },
    { label: 'Chicago', value: 'Chicago' },
    { label: 'San Francisco', value: 'San Francisco' },
  ],
})

const Destinations = ({ value, onChange, edit }) => {
  return (
    <Select.Root
      collection={location}
      value={value ? [value] : []}
      onValueChange={(details) => onChange(details.value[0] || '')}
      size={edit ? 'sm' : 'md'}
      width={edit ? '150px' : '300px'}
    >
      <Select.HiddenSelect />
      {!edit && <Heading>Destination</Heading>}
      <Select.Control>
        <Select.Trigger borderRadius={'full'} bg='white'>
          <Select.ValueText placeholder='Where are we going?' />
        </Select.Trigger>
        <Select.IndicatorGroup>
          <Select.Indicator />
        </Select.IndicatorGroup>
      </Select.Control>
      <Portal>
        <Select.Positioner>
          <Select.Content>
            {location.items.map((location) => (
              <Select.Item item={location} key={location.value}>
                {location.label}
                <Select.ItemIndicator />
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Positioner>
      </Portal>
    </Select.Root>
  )
}
export default Destinations
