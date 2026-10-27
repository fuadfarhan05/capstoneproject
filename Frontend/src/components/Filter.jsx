import { Select, Portal, createListCollection } from '@chakra-ui/react'
import { useMemo, useState } from 'react'

const cityOptions = [
  { label: 'New York City', value: 'new-york-city' },
  { label: 'Chicago', value: 'chicago' },
  { label: 'San Francisco', value: 'san-francisco' },
]

const distanceOptions = [
  { label: 'Within 1 mile', value: '1' },
  { label: 'Within 5 miles', value: '5' },
  { label: 'Within 10 miles', value: '10' },
  { label: 'Within 25 miles', value: '25' },
]

const priceOptions = [
  { label: '$', value: '1' },
  { label: '$$', value: '2' },
  { label: '$$$', value: '3' },
  { label: '$$$$', value: '4' },
]

const sortOptions = [
  { label: 'Price: low to high', value: 'price-asc' },
  { label: 'Price: high to low', value: 'price-desc' },
  { label: 'Distance: nearest', value: 'distance' },
  { label: 'Rating: highest', value: 'rating' },
]

const filters = {
  city: { placeholder: 'City', options: cityOptions },
  distance: { placeholder: 'Distance', options: distanceOptions },
  price: { placeholder: 'Price', options: priceOptions },
  sort: { placeholder: 'Sort by', options: sortOptions },
}

const Filter = ({ filter, onChange }) => {
  const [value, setValue] = useState('')

  const { placeholder, options } = filters[filter]

  const collection = useMemo(
    () => createListCollection({ items: options }),
    [options]
  )

  const handleChange = (details) => {
    const selectedValue = details.value[0] ?? ''
    setValue(selectedValue)
    onChange(selectedValue)
  }

  return (
    <Select.Root
      collection={collection}
      value={value ? [value] : []}
      onValueChange={handleChange}
      width='180px'
    >
      <Select.HiddenSelect />

      <Select.Control>
        <Select.Trigger
          borderRadius='full'
          px={4}
          bg='white'
          color='#12304A'
          borderColor='gray.200'
          _hover={{ bg: 'gray.50' }}
        >
          <Select.ValueText placeholder={placeholder} />
        </Select.Trigger>
        <Select.IndicatorGroup pr={2}>
          <Select.Indicator />
        </Select.IndicatorGroup>
      </Select.Control>

      <Portal>
        <Select.Positioner>
          <Select.Content borderRadius='xl'>
            {collection.items.map((item) => (
              <Select.Item key={item.value} item={item}>
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

export default Filter
