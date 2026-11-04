import { useState } from 'react'
import PlansContext from './PlansContext'

const PlansProvider = ({ children }) => {
  const [plans, setPlans] = useState([])

  const addPlan = (plan) => {
    setPlans((currentPlans) => [...currentPlans, plan])
  }

  const addActivityToPlan = (planId, activity) => {
    setPlans((currentPlans) =>
      currentPlans.map((plan) =>
        plan.id === planId
          ? {
              ...plan,
              activities: [...(plan.activities || []), activity],
            }
          : plan
      )
    )
  }

  return (
    <PlansContext.Provider
      value={{ plans, setPlans, addPlan, addActivityToPlan }}
    >
      {children}
    </PlansContext.Provider>
  )
}

export default PlansProvider
