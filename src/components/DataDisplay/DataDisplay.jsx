import React from "react"
import PropTypes from "prop-types"
import {
  Typography,
  Link,
  Button,
  Grid,
  CircularProgress,
} from "@material-ui/core"
import { Link as Router } from "react-router-dom"

function DataDisplay({
  loading,
  loadingComponent,
  empty,
  error,
  errorMessage,
  children,
}) {
  if (loading) {
    if (loadingComponent) {
      return loadingComponent
    }
    return (
      <Grid
        container
        justify="center"
        alignItems="center"
        style={{ height: "85vh" }}
      >
        <CircularProgress size="5rem" disableShrink />
      </Grid>
    )
  }

  if (error) {
    return (
      <Grid
        container
        justify="center"
        alignItems="center"
        direction="column"
        style={{ height: "90vh" }}
      >
        <Typography variant="h2" align="center" color="error">
          Error
        </Typography>
        <Typography variant="body1" align="center">
          {errorMessage}
        </Typography>
      </Grid>
    )
  }

  if (empty) {
    return (
      <div style={{ marginTop: "10em" }}>
        <Typography align="center" variant="h4" gutterBottom>
          You haven't watched anything yet.
        </Typography>
        <Typography align="center">
          <Link underline="none" component={Router} to="/search">
            <Button color="secondary" variant="contained">
              Search Here
            </Button>
          </Link>
        </Typography>
      </div>
    )
  }
  return <div>{children}</div>
}

DataDisplay.propTypes = {
  loading: PropTypes.bool.isRequired,
  empty: PropTypes.bool,
  error: PropTypes.bool,
  errorMessage: PropTypes.string,
  children: PropTypes.node.isRequired,
}

export default DataDisplay
