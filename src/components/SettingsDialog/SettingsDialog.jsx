import React, { useState, useEffect } from "react"
import PropTypes from "prop-types"
import {
  Dialog,
  DialogTitle,
  Typography,
  Grid,
  IconButton,
  Divider,
  DialogContent,
  Container,
} from "@material-ui/core"
import { Close } from "@material-ui/icons"
// import { ReactComponent as KitsuLogo } from "images/kitsu-icon.svg"
import { getDatabase } from "db/rxdb"
import KitsuCard from "./KitsuCard"

function SettingsDialog({ open, onClose }) {
  const handleClose = () => {
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} fullScreen>
      <DialogTitle disableTypography>
        <Grid container justify="space-between" alignItems="center">
          <Typography variant="h5">Settings</Typography>
          <IconButton onClick={handleClose}>
            <Close />
          </IconButton>
        </Grid>
      </DialogTitle>
      <Divider />

      <DialogContent>
        <Container maxWidth="sm">
          <Typography variant="h5" gutterBottom>
            Accounts
          </Typography>
          <KitsuCard />
        </Container>
      </DialogContent>
    </Dialog>
  )
}

SettingsDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
}

export default SettingsDialog
