import React, { createContext, useReducer } from "react"

// Actions
const SET_KITSU_TOKEN = "SET_KITSU_TOKEN"
const SET_MAL_TOKEN = "SET_MAL_TOKEN"

// Action Creators
export const setKitsuToken = (token) => {
  return {
    type: SET_KITSU_TOKEN,
    payload: token,
  }
}

export const setMalToken = (token) => {
  return {
    type: SET_MAL_TOKEN,
    payload: token,
  }
}

// Initial State
const initState = {
  kitsuAccessToken: null,
  malAccessToken: null,
}

export const AuthTokenContext = createContext({ initState, dispatch: () => {} })

const { Provider } = AuthTokenContext

export const AuthTokenProvider = ({ children }) => {
  const [state, dispatch] = useReducer((state, action) => {
    switch (action.type) {
      case SET_KITSU_TOKEN:
        return { ...state, kitsuAccessToken: action.payload }

      case SET_MAL_TOKEN:
        return { ...state, malAccessToken: action.payload }
    }
  }, initState)

  return <Provider value={{ state, dispatch }}>{children}</Provider>
}
