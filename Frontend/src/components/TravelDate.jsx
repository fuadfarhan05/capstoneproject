import { DatePicker, Portal, Heading } from '@chakra-ui/react'
import { LuCalendar } from 'react-icons/lu'
import { parseDate } from '@internationalized/date'

const TravelDate = ({ value, onChange, edit }) => {
  const dateValue = value ? [parseDate(String(value).slice(0, 10))] : []

  return (
    <DatePicker.Root
      maxWidth={edit ? '10rem' : '20rem'}
      value={dateValue}
      onValueChange={(details) => onChange(details.value[0]?.toString() || '')}
    >
      {!edit && <Heading>Travel Date</Heading>}

      <DatePicker.Control>
        <DatePicker.Input borderRadius='full' bg='white' />

        <DatePicker.IndicatorGroup>
          <DatePicker.Trigger borderRadius='full' bg='white'>
            <LuCalendar />
          </DatePicker.Trigger>
        </DatePicker.IndicatorGroup>
      </DatePicker.Control>

      <Portal>
        <DatePicker.Positioner>
          <DatePicker.Content>
            <DatePicker.View view='day'>
              <DatePicker.Header />
              <DatePicker.DayTable />
            </DatePicker.View>

            <DatePicker.View view='month'>
              <DatePicker.Header />
              <DatePicker.MonthTable />
            </DatePicker.View>

            <DatePicker.View view='year'>
              <DatePicker.Header />
              <DatePicker.YearTable />
            </DatePicker.View>
          </DatePicker.Content>
        </DatePicker.Positioner>
      </Portal>
    </DatePicker.Root>
  )
}

export default TravelDate
