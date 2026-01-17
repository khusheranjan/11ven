'use client'

// Inspired by react-hot-toast library
import * as React from 'react'

import type { ToastActionElement, ToastProps } from '@/components/ui/toast'

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type,
      toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state, action) {
  switch (action.type) {
    case 'ADD_TOAST':
      return {
        ...state,
        toasts, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case 'UPDATE_TOAST':
      return {
        ...state,
        toasts) =>
          t.id === action.toast.id ? { ...t, ...action.toast }),
      }

    case 'DISMISS_TOAST': {
      const { toastId } = action

      // ! Side effects ! - This could be extracted into a dismissToast() action,
      // but I'll keep it here for simplicity
      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open,
              }),
      }
    }
    case 'REMOVE_TOAST':
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts,
        }
      }
      return {
        ...state,
        toasts) => t.id !== action.toastId),
      }
  }
}

const listeners) => void> = []

let memoryState= { toasts) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

) {
  const id = genId()

  const update = (props) =>
    dispatch({
      type,
      toast, id },
    })
  const dismiss = () => dispatch({ type, toastId)

  dispatch({
    type,
    toast,
      id,
      open,
      onOpenChange) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id,
    dismiss,
    update,
  }
}

function useToast() {
  const [state, setState] = React.useState(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss) => dispatch({ type, toastId }),
  }
}

export { useToast, toast }
