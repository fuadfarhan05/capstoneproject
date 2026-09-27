import { Select, Portal, createListCollection } from '@chakra-ui/react'
import { useMemo } from 'react'

// Pill-shaped dropdown used in the filter bar. `value` is a single string
// ('' when nothing is picked) so parents don't have to deal with arrays.
const FilterSelect = ({ label, options, value, onChange, width = '180px' }) => {
  const collection = useMemo(
    () => createListCollection({ items: options }),
    [options],
  )

  return (
    <Select.Root
      collection={collection}
      size='md'
      width={width}
      value={value ? [value] : []}
      onValueChange={(e) => onChange(e.value[0] ?? '')}
    >
      <Select.HiddenSelect />
      <Select.Control>
        <Select.Trigger
          borderRadius='full'
          px={4}
          bg={value ? 'gray.900' : 'bg'}
          color={value ? 'white' : 'fg'}
          _dark={{
            bg: value ? 'gray.100' : 'bg',
            color: value ? 'black' : 'fg',
          }}
        >
          <Select.ValueText placeholder={label} />
        </Select.Trigger>
        <Select.IndicatorGroup pr={2}>
          {value && (
            <Select.ClearTrigger color='white' _dark={{ color: 'black' }} />
          )}
          <Select.Indicator
            color={value ? 'white' : 'fg.muted'}
            _dark={{ color: value ? 'black' : 'fg.muted' }}
          />
        </Select.IndicatorGroup>
      </Select.Control>
      <Portal>
        <Select.Positioner>
          <Select.Content borderRadius='xl'>
            {collection.items.map((item) => (
              <Select.Item item={item} key={item.value} borderRadius='lg'>
                {item.label}
                <Select.ItemIndicator />
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Positioner>
      </Portal>
    </Select.Root>
  )
}

export default FilterSelect
