import React from "react"
import { Route, Switch, BrowserRouter } from "react-router-dom"
import Dashboard from "pages/Dashboard"
import Library from "pages/Library"
import Search from "pages/Search"
import SideNav from "components/SideNav"

export default function Routes() {
  return (
    <BrowserRouter>
      <Switch>
        <SideNav>
          <Route exact path="/" component={Dashboard} />
          <Route path="/search" component={Search} />
          <Route path="/library/:status" component={Library} />
        </SideNav>

        <Route path="*" component={Dashboard} />
      </Switch>
    </BrowserRouter>
  )
}
