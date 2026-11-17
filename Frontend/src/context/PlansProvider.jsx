import { useEffect, useRef, useState } from 'react'
import PlansContext from './PlansContext'
import { useAuth } from '../AuthContext'
import * as plansApi from '../plans'
import { findUserByEmail } from '../userLookup'

// Trips used to be kept in this browser under this key. They're moved into
// the user's Firestore account the first time they log in (see below).
const LEGACY_STORAGE_KEY = 'triply-plans'

const readLegacyPlans = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY))
    return Array.isArray(saved) ? saved : []
  } catch {
    return []
  }
}

const logError = (action) => (err) => {
  console.error(`Could not ${action}:`, err.code ?? err)
  throw err
}

// Trips are stored in Firestore (plans/{planId}) so they can be shared:
// everyone in a trip's memberIds sees it here and can edit it.
const PlansProvider = ({ children }) => {
  const { user } = useAuth()
  const uid = user?.uid ?? null

  const [state, setState] = useState({
    uid: null,
    plans: [],
    loading: false,
    error: null,
  })

  // reset as soon as the user changes, before their trips arrive
  if (state.uid !== uid) {
    setState({ uid, plans: [], loading: Boolean(uid), error: null })
  }

  useEffect(() => {
    if (!uid) return
    return plansApi.watchPlans(
      uid,
      (plans) => setState({ uid, plans, loading: false, error: null }),
      (err) => {
        console.error('Could not load trips:', err.code ?? err)
        setState({ uid, plans: [], loading: false, error: err })
      },
    )
  }, [uid])

  // One-time move of trips saved in this browser into the account
  const migratedFor = useRef(null)
  useEffect(() => {
    if (!user || migratedFor.current === user.uid) return
    migratedFor.current = user.uid
    const legacyPlans = readLegacyPlans()
    if (legacyPlans.length === 0) return

    Promise.all(legacyPlans.map((plan) => plansApi.createPlan(plan, user)))
      .then(() => localStorage.removeItem(LEGACY_STORAGE_KEY))
      .catch((err) =>
        console.error('Could not move saved trips to your account:', err),
      )
  }, [user])

  const findPlan = (planId) =>
    state.plans.find((plan) => String(plan.id) === String(planId))

  const createPlan = (newPlan) =>
    plansApi.createPlan(newPlan, user).catch(logError('create trip'))

  const updatePlan = (updatedPlan) =>
    plansApi
      .updatePlanDetails(updatedPlan.id, updatedPlan)
      .catch(logError('update trip'))

  const deletePlan = (planId) =>
    plansApi.deletePlan(planId).catch(logError('delete trip'))

  const addActivityToPlan = (planId, activity) => {
    const plan = findPlan(planId)
    const alreadyAdded = (plan?.activities ?? []).some(
      (item) => String(item.id) === String(activity.id),
    )
    if (alreadyAdded) return Promise.resolve()
    return plansApi
      .addActivity(planId, activity)
      .catch(logError('add activity to trip'))
  }

  // Adds someone with a Triply account to a trip by email.
  // Resolves to 'added' | 'already-member' | 'not-found' | 'self'.
  const addFriendByEmail = async (planId, email) => {
    if (email.trim().toLowerCase() === user?.email?.toLowerCase()) {
      return 'self'
    }
    const profile = await findUserByEmail(email)
    if (!profile) return 'not-found'
    if (findPlan(planId)?.memberIds?.includes(profile.uid)) {
      return 'already-member'
    }
    await plansApi.addMember(planId, profile).catch(logError('add friend'))
    return 'added'
  }

  const removeMember = (planId, memberUid) =>
    plansApi.removeMember(planId, memberUid).catch(logError('remove member'))

  const leavePlan = (planId) => removeMember(planId, uid)

  const joinPlan = (planId, inviteCode) =>
    plansApi.joinPlan(planId, inviteCode, user).catch(logError('join trip'))

  const value = {
    plans: state.plans,
    loading: state.loading,
    error: state.error,
    createPlan,
    updatePlan,
    deletePlan,
    addActivityToPlan,
    addFriendByEmail,
    removeMember,
    leavePlan,
    joinPlan,
    getInviteLink: plansApi.inviteLink,
  }

  return <PlansContext.Provider value={value}>{children}</PlansContext.Provider>
}

export default PlansProvider
