import React from "react"
import { Route, Switch } from "react-router-dom"
// import { LinearProgress } from '@material-ui/core';
// import App from "./App";
import Dashboard from "pages/Dashboard"
import Library from "pages/Library"
import Search from "pages/Search"

// const Dashboard = lazy(() => import('pages/Dashboard'))
// const Library = lazy(() => import('pages/Library'))
// const Search = lazy(() => import('pages/Search'))

export default function Routes() {
  return (
    <Switch>
      {/* <Suspense fallback={<LinearProgress/>}> */}
      <Route exact path="/" component={Dashboard} />
      <Route path="/search" component={Search} />
      <Route path="/library/:status" component={Library} />
      <Route path="*" component={Dashboard} />
      {/* </Suspense> */}
    </Switch>
  )
}
