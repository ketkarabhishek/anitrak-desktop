import React, { useEffect, useState } from "react"
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
import { importLibraryFromKitu } from "db/rxdb/utils"
import KitsuApi from "kitsu-api-wrapper"

export default function KitsuSettingsDialog({ open, onClose }) {
  const { enqueueSnackbar } = useSnackbar()

  // const [currentKitsuSlug, setCurrentKitsuSlug] = useState("");
  const [newKitsuSlug, setNewKitsuSlug] = useState("")

  const [currentKitsuPwd, setCurrentKitsuPwd] = useState("")

  const [kitsuPassVisible, setKitsuPassVisible] = useState(false)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [importing, setImporting] = useState(false)

  const kitsuApi = new KitsuApi()

  const handleClose = () => {
    onClose()
  }

  const handleKitsuSlug = (e) => {
    setNewKitsuSlug(e.target.value)
  }

  const handleKitsuPassword = (e) => {
    setCurrentKitsuPwd(e.target.value)
  }

  const handleKitsuSave = async () => {
    setSaving(true)
    console.log(process.env.NODE_ENV)

    try {
      await kitsuApi.auth.login(newKitsuSlug, currentKitsuPwd)
      const user = await kitsuApi.users.fetchBySlug(newKitsuSlug)
      const userId = user.id
      const db = await getDatabase()
      const site = await db.website.upsert({
        siteName: "kitsu",
        userId: userId,
        userName: newKitsuSlug,
        password: currentKitsuPwd,
      })
      console.log(site)
      setSaving(false)
      enqueueSnackbar("Kitsu account saved.", { variant: "success" })
    } catch (error) {
      setSaving(false)
      console.error(error)
      enqueueSnackbar(error.toString(), { variant: "error" })
    }
  }

  const handleLibraryImport = async () => {
    setImporting(true)
    try {
      const db = await getDatabase()
      const site = await db.website
        .findOne({ selector: { siteName: "kitsu" } })
        .exec()
      if (site) {
        const creds = await kitsuApi.auth.login(newKitsuSlug, currentKitsuPwd)
        const user = await kitsuApi.users.fetchBySlug(newKitsuSlug)
        const userId = user.id

        const imported = await importLibraryFromKitu(creds, userId)
        console.log(imported)
        setImporting(false)
      } else {
        console.log("No Kitsu account in db.")
        setImporting(false)
        enqueueSnackbar("Kitsu Import: No Kitsu account found in database!", {
          variant: "error",
        })
      }
    } catch (error) {
      console.error(error)
      setImporting(false)
      enqueueSnackbar("Kitsu Import: " + error, { variant: "error" })
    }
  }

  useEffect(() => {
    const getSite = async () => {
      try {
        const db = await getDatabase()
        const site = await db.website
          .findOne({ selector: { siteName: "kitsu" } })
          .exec()
        console.log(site)

        if (site != null) {
          // setCurrentKitsuSlug(site.userName);
          setNewKitsuSlug(site.userName)
          setCurrentKitsuPwd(site.password)
          setLoading(false)
        } else {
          setLoading(false)
        }
      } catch (error) {
        console.error(error)
        setLoading(false)
      }
    }

    getSite()
  }, [])

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle disableTypography>
        <Grid container justify="space-between">
          <KitsuLogo style={{ width: "20%", height: "auto" }} />
          <IconButton size="small" onClick={handleClose}>
            <Close />
          </IconButton>
        </Grid>
      </DialogTitle>
      <Divider />

      {loading ? (
        <CircularProgress />
      ) : (
        <DialogContent>
          <TextField
            id="kitsuSlug"
            onChange={handleKitsuSlug}
            value={newKitsuSlug}
            margin="normal"
            variant="outlined"
            label="Username"
            helperText="Unique SLUG of your account"
            fullWidth
          />

          <TextField
            id="kitsuPassword"
            onChange={handleKitsuPassword}
            value={currentKitsuPwd}
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
            onClick={handleKitsuSave}
            fullWidth
            style={{ marginBottom: 20 }}
          >
            {saving ? (
              <CircularProgress size={24} color="inherit"></CircularProgress>
            ) : (
              "Save"
            )}
          </Button>

          <Divider />
          <Button
            variant="outlined"
            color="primary"
            onClick={handleLibraryImport}
            fullWidth
            disabled={importing}
            style={{ margin: "20px 0 10px 0" }}
          >
            {importing ? (
              <CircularProgress size={24} color="inherit"></CircularProgress>
            ) : (
              "Import Kitsu Library"
            )}
          </Button>
        </DialogContent>
      )}
    </Dialog>
  )
}
