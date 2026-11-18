import { useContext } from 'react'
import PlansContext from './PlansContext'

const usePlans = () => {
  const context = useContext(PlansContext)

  if (!context) {
    throw new Error('usePlans must be used inside PlansProvider')
  }

  return context
}

export default usePlans
