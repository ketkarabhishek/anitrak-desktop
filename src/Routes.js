import React from "react";
import { Route, Switch, BrowserRouter } from "react-router-dom";
import App from "./App";

import Dashboard from "./pages/Dashboard";
import Library from "./pages/Library";

import Search from "./pages/Search";

const Routes = () => (
  <BrowserRouter>
    <App>
      <Switch>
        <Route exact path="/" component={Dashboard} />
        <Route exact path="/search" component={Search} />
        <Route exact path="/library/:status" component={Library} />
        <Route path="*" component={Dashboard} />
      </Switch>
    </App>
  </BrowserRouter>
);

export default Routes;
