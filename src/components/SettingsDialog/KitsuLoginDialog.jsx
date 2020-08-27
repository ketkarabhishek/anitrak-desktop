import React, { useState } from "react"
import {
  Dialog,
  DialogTitle,
  Grid,
  IconButton,
  DialogContent,
  TextField,
  Button,
  CircularProgress,
  Divider,
} from "@material-ui/core"

import { Close, Visibility, VisibilityOff } from "@material-ui/icons"
import { useSnackbar } from "notistack"
import { ReactComponent as KitsuLogo } from "images/kitsu.svg"
import { getDatabase } from "db/rxdb"
import KitsuApi from "kitsu-api-wrapper"
import DataDisplay from "components/DataDisplay/DataDisplay"

export default function KitsuLoginDialog({ open, onClose }) {
  const { enqueueSnackbar } = useSnackbar()

  const [kitsuSlug, setKitsuSlug] = useState("")

  const [kitsuPwd, setKitsuPwd] = useState("")

  const [kitsuPassVisible, setKitsuPassVisible] = useState(false)

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleKitsuSlug = (e) => {
    setKitsuSlug(e.target.value)
  }

  const handleKitsuPassword = (e) => {
    setKitsuPwd(e.target.value)
  }

  const handleKitsuSave = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const kitsuApi = new KitsuApi()
      const kitsuToken = await kitsuApi.auth.login(kitsuSlug, kitsuPwd)
      const user = await kitsuApi.users.fetchBySlug(kitsuSlug)
      const db = await getDatabase()
      const site = await db.website.upsert({
        siteName: "kitsu",
        userId: user.id,
        userName: kitsuSlug,
        avatar: user.attributes.avatar.original,
        password: kitsuToken.refresh_token,
      })
      console.log(kitsuToken)
      console.log(site)
      setSaving(false)
      enqueueSnackbar("Kitsu account saved.", { variant: "success" })
      onClose()
    } catch (error) {
      setSaving(false)
      console.error(error)
      enqueueSnackbar(error.toString(), { variant: "error" })
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle disableTypography>
        <Grid container justify="space-between">
          <KitsuLogo style={{ width: "20%", height: "auto" }} />
          <IconButton size="small" onClick={onClose}>
            <Close />
          </IconButton>
        </Grid>
      </DialogTitle>
      <Divider />

      <DialogContent>
        <DataDisplay
          loading={loading}
          loadingComponent={
            <Grid container justify="center" alignItems="center">
              <CircularProgress style={{ margin: "100px 0" }} />
            </Grid>
          }
        >
          <form onSubmit={handleKitsuSave}>
            <TextField
              id="kitsuSlug"
              onChange={handleKitsuSlug}
              value={kitsuSlug}
              margin="normal"
              variant="outlined"
              label="Username"
              helperText="Unique SLUG of your account"
              fullWidth
            />

            <TextField
              id="kitsuPassword"
              onChange={handleKitsuPassword}
              value={kitsuPwd}
              margin="normal"
              variant="outlined"
              label="Password"
              type={kitsuPassVisible ? "text" : "password"}
              fullWidth
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => setKitsuPassVisible(!kitsuPassVisible)}
                  >
                    {kitsuPassVisible ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                ),
              }}
            />

            <Button
              variant="contained"
              color="primary"
              disabled={saving}
              // onClick={handleKitsuSave}
              fullWidth
              style={{ margin: "20px 0" }}
              type="submit"
            >
              {saving ? (
                <CircularProgress size={24} color="inherit"></CircularProgress>
              ) : (
                "Login"
              )}
            </Button>
          </form>
        </DataDisplay>
      </DialogContent>
    </Dialog>
  )
}
