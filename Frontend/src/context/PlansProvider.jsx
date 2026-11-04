import { useState, useEffect } from 'react'
import PlansContext from './PlansContext'

const STORAGE_KEY = 'triply-plans'

const PlansProvider = ({ children }) => {
  // Load previously saved plans when the app starts.
  const [plans, setPlans] = useState(() => {
    try {
      const savedPlans = localStorage.getItem(STORAGE_KEY)

      return savedPlans ? JSON.parse(savedPlans) : []
    } catch (error) {
      console.error('Error loading plans:', error)
      return []
    }
  })

  // Save plans whenever they are created, edited, or deleted.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plans))
    } catch (error) {
      console.error('Error saving plans:', error)
    }
  }, [plans])

  const createPlan = (newPlan) => {
    setPlans((currentPlans) => [...currentPlans, newPlan])
  }

  const updatePlan = (updatedPlan) => {
    setPlans((currentPlans) =>
      currentPlans.map((plan) =>
        plan.id === updatedPlan.id ? updatedPlan : plan
      )
    )
  }

  const deletePlan = (planId) => {
    setPlans((currentPlans) =>
      currentPlans.filter((plan) => plan.id !== planId)
    )
  }

  const addActivityToPlan = (planId, activity) => {
    setPlans((currentPlans) =>
      currentPlans.map((plan) => {
        if (plan.id !== planId) return plan

        const activities = plan.activities || []

        const alreadyAdded = activities.some(
          (item) => String(item.id) === String(activity.id)
        )

        if (alreadyAdded) return plan

        return {
          ...plan,
          activities: [...activities, activity],
        }
      })
    )
  }

  const value = {
    plans,
    setPlans,
    createPlan,
    updatePlan,
    deletePlan,
    addActivityToPlan,
  }

  return <PlansContext.Provider value={value}>{children}</PlansContext.Provider>
}

export default PlansProvider
