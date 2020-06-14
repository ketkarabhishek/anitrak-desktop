import React, { useState, useEffect } from "react"
import {
  TextField,
  IconButton,
  Button,
  Dialog,
  Grid,
  DialogTitle,
  DialogContent,
  Divider,
  CircularProgress,
} from "@material-ui/core"
import mal from "images/mal.png"
import Img from "react-image"
import { Visibility, VisibilityOff, Close } from "@material-ui/icons"
import { malLogin } from "apis/mal/auth"
import { GetMalUserId } from "apis/mal/library"
import { getDatabase } from "db/rxdb"
import { importLibraryFromMal } from "db/rxdb/utils"
import { useSnackbar } from "notistack"

export default function MalSettingsDialog({ open, onClose }) {
  const [malPassVisible, setMalPassVisible] = useState(false)

  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState(false)

  const [malUsername, setMalUsername] = useState("")
  const [malPassword, setMalPassword] = useState("")

  const { enqueueSnackbar } = useSnackbar()

  const handleClose = () => {
    onClose()
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await malLogin(malUsername, malPassword)
      const userId = await GetMalUserId(malUsername)
      const db = await getDatabase()
      const site = await db.website.upsert({
        siteName: "mal",
        userId: userId.toString(),
        userName: malUsername,
        password: malPassword,
      })
      console.log(site)
      setSaving(false)
      enqueueSnackbar("MAL account saved.", { variant: "success" })
    } catch (error) {
      console.error(error)
      setSaving(false)
      enqueueSnackbar(error, { variant: "error" })
    }
  }

  const handleLibraryImport = async () => {
    setImporting(true)
    try {
      const db = await getDatabase()
      const site = await db.website
        .findOne({ selector: { siteName: "mal" } })
        .exec()
      if (site) {
        const imported = await importLibraryFromMal(site.userName)
        console.log(imported)
        setImporting(false)
      } else {
        console.log("No MAL account in db.")
        setImporting(false)
        enqueueSnackbar("MAL Import: No MAL account found in database!", {
          variant: "error",
        })
      }
    } catch (error) {
      console.error(error)
      enqueueSnackbar("MAL Import: " + error, { variant: "error" })
    }
  }

  const handleUsername = (e) => {
    setMalUsername(e.target.value)
  }

  const handlePassword = (e) => {
    setMalPassword(e.target.value)
  }

  useEffect(() => {
    const getData = async () => {
      try {
        const db = await getDatabase()
        const site = await db.website
          .findOne({ selector: { siteName: "mal" } })
          .exec()
        console.log(site)

        if (site != null) {
          setMalUsername(site.userName)
          setMalPassword(site.password)
          setLoading(false)
        } else {
          setLoading(false)
        }
      } catch (error) {
        console.error(error)
        setLoading(false)
      }
    }
    getData()
  }, [])
  return (
    <div>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle disableTypography>
          <Grid container justify="space-between">
            <Img src={mal} style={{ width: "30%", height: "auto" }} />
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
              id="username"
              variant="outlined"
              label="Username"
              margin="normal"
              type="text"
              fullWidth
              value={malUsername}
              onChange={handleUsername}
            />

            <TextField
              id="password"
              variant="outlined"
              label="Password"
              margin="normal"
              type={malPassVisible ? "text" : "password"}
              fullWidth
              value={malPassword}
              onChange={handlePassword}
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => setMalPassVisible(!malPassVisible)}
                  >
                    {malPassVisible ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                ),
              }}
            />

            <Button
              color="primary"
              variant="contained"
              fullWidth
              style={{ marginBottom: 10 }}
              onClick={handleSave}
              disabled={saving}
              type="submit"
            >
              {saving ? <CircularProgress color="inherit" size={24} /> : "Save"}
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
                "Import MAL Library"
              )}
            </Button>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
