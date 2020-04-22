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
  Divider,
} from "@material-ui/core";
import {
  GetPrimarySite,
  EditWebsite,
  replaceLibrary,
  GetSites,
} from "db/linvodb/LinvodbHelper";
import { Close, Visibility, VisibilityOff } from "@material-ui/icons";
import { KitsuLogin } from "apis/kitsu/kitsu-auth";
import { useSnackbar } from "notistack";
import { ReactComponent as KitsuLogo } from "images/kitsu.svg";
import mal from "images/mal.png";
import Img from "react-image";
import { Formik, Form, Field } from "formik";

export default function SyncSettingsDialog({
  open,
  onClose,
  setKitsuSyncSwitch,
  setKitsuCreds,
}) {
  const { enqueueSnackbar } = useSnackbar();

  const [currentKitsuSlug, setCurrentKitsuSlug] = useState("");
  const [newKitsuSlug, setNewKitsuSlug] = useState("");

  const [currentKitsuPwd, setCurrentKitsuPwd] = useState("");

  const [kitsuPassVisible, setKitsuPassVisible] = useState(false);

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setSubmitting] = useState(false);

  const handleClose = () => {
    onClose();
  };

  const handleKitsuSlug = (e) => {
    setNewKitsuSlug(e.target.value);
  };

  const handleKitsuPassword = (e) => {
    setCurrentKitsuPwd(e.target.value);
  };

  const handleKitsuSave = async () => {
    setSubmitting(true);
    try {
      const creds = await KitsuLogin(newKitsuSlug, currentKitsuPwd);
      const site = await EditWebsite("kitsu", newKitsuSlug, currentKitsuPwd);
      creds.userId = site.userId;
      setKitsuSyncSwitch(true);
      setKitsuCreds(creds);
      if (currentKitsuSlug !== newKitsuSlug) {
        const liblen = await replaceLibrary(creds);
        setSubmitting(false);
        enqueueSnackbar(
          "Kitsu Library fetched successfully. Total Entries: " + liblen,
          { variant: "info" }
        );
        handleClose();
      } else {
        setSubmitting(false);
        handleClose();
      }
    } catch (error) {
      setSubmitting(false);
      console.error(error);
      enqueueSnackbar(error, { variant: "error" });
    }
  };

  useEffect(() => {
    const getSite = async () => {
      try {
        const site = await GetPrimarySite();
        console.log(site);

        if (site != null) {
          setCurrentKitsuSlug(site.userName);
          setNewKitsuSlug(site.userName);
          setCurrentKitsuPwd(site.password);
          setLoading(false);
        }
      } catch (error) {
        console.error(error);
      }
    };

    getSite();
  }, []);

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle disableTypography>
        <Grid container justify="space-between">
          <Typography variant="h5">Accounts and Settings</Typography>
          <IconButton size="small" onClick={handleClose}>
            <Close />
          </IconButton>
        </Grid>
      </DialogTitle>
      <Divider />

      {/* Formik From */}
      {loading ? (
        <CircularProgress />
      ) : (
        <DialogContent>
          <KitsuLogo
            style={{ width: "25%", height: "auto", display: "block" }}
          />
          <TextField
            id="kitsuSlug"
            onChange={handleKitsuSlug}
            value={newKitsuSlug}
            margin="normal"
            variant="outlined"
            label="Username"
            helperText="Unique SLUG of your account"
            style={{ marginRight: 10 }}
          />

          <TextField
            id="kitsuPassword"
            onChange={handleKitsuPassword}
            value={currentKitsuPwd}
            margin="normal"
            variant="outlined"
            label="Password"
            type={kitsuPassVisible ? "text" : "password"}
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
        </DialogContent>
      )}

      <Divider />
      <DialogActions>
        <Button
          variant="contained"
          color="primary"
          disabled={isSubmitting}
          onClick={handleKitsuSave}
        >
          Save
          {isSubmitting && (
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
