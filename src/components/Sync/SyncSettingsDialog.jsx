import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  Grid,
  Typography,
  IconButton,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  CircularProgress,
} from "@material-ui/core";
import {
  GetPrimarySite,
  EditWebsite,
  replaceLibrary,
} from "db/linvodb/LinvodbHelper";
import { Close, Visibility, VisibilityOff } from "@material-ui/icons";
import { KitsuLogin } from "apis/kitsu/kitsu-auth";
import { useSnackbar } from "notistack";

export default function SyncSettingsDialog({
  open,
  onClose,
  setKitsuSyncSwitch,
  setKitsuCreds,
}) {
  const { enqueueSnackbar } = useSnackbar();

  const [kitsuSlug, setKitsuSlug] = useState("");
  const [newKitsuSlug, setNewKitsuSlug] = useState("");

  // const[kitsuPwd, setKitsuPwd] = useState("")
  const [newKitsuPwd, setNewKitsuPwd] = useState("");

  const [passVisible, setPassVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleClose = () => {
    onClose();
  };

  const handleSlugText = (e) => {
    setNewKitsuSlug(e.target.value);
  };

  const handlePwdText = (e) => {
    setNewKitsuPwd(e.target.value);
  };

  const handleShowPass = () => {
    setPassVisible(!passVisible);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const creds = await KitsuLogin(newKitsuSlug, newKitsuPwd);
      const site = await EditWebsite("kitsu", newKitsuSlug, newKitsuPwd);
      creds.userId = site.userId;
      setKitsuSyncSwitch(true);
      setKitsuCreds(creds);
      if (kitsuSlug !== newKitsuSlug) {
        const liblen = await replaceLibrary(creds);
        setSaving(false);
        enqueueSnackbar(
          "Kitsu Library fetched successfully. Total Entries: " + liblen,
          { variant: "info" }
        );
        handleClose();
      } else {
        setSaving(false);
        handleClose();
      }
    } catch (error) {
      setSaving(false);
      console.error(error);
      enqueueSnackbar(error, { variant: "error" });
    }
  };

  useEffect(() => {
    const getSite = async () => {
      const site = await GetPrimarySite();
      console.log(site);

      if (site != null) {
        // setSync(site.sync)
        setKitsuSlug(site.userName);
        setNewKitsuSlug(site.userName);
        // setKitsuPwd(site.password)
        setNewKitsuPwd(site.password);
      }
    };

    getSite();
  }, []);

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle disableTypography>
        <Grid container justify="space-between">
          <Typography variant="h5">Accounts</Typography>
          <IconButton size="small" onClick={handleClose}>
            <Close />
          </IconButton>
        </Grid>
      </DialogTitle>

      <DialogContent>
        <TextField
          value={newKitsuSlug}
          onChange={handleSlugText}
          margin="normal"
          variant="outlined"
          label="Username"
          helperText="Enter the unique SLUG of your account"
          style={{ marginRight: 10 }}
        ></TextField>
        <TextField
          value={newKitsuPwd}
          onChange={handlePwdText}
          margin="normal"
          variant="outlined"
          label="Password"
          type={passVisible ? "text" : "password"}
          InputProps={{
            endAdornment: (
              <IconButton onClick={handleShowPass}>
                {passVisible ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            ),
          }}
        ></TextField>

        <Typography variant="subtitle1" color="error">
          Warning!
        </Typography>
        <Typography variant="subtitle2">
          Changing the Username(SLUG) will replace all the entries.
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          disabled={saving}
        >
          Save
          {saving && (
            <CircularProgress
              style={{ marginLeft: 10 }}
              size={20}
              color="inherit"
            ></CircularProgress>
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
