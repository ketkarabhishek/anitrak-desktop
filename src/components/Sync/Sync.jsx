import React, { useState, useEffect } from "react";
import { ListItem, ListItemText, List, IconButton } from "@material-ui/core";
import { SyncOutlined, SyncDisabled, Settings } from "@material-ui/icons";
import {
  GetPrimarySite,
  ToggleSiteSync,
  GetGenreCount,
  InsertKitsuGenres,
} from "db/linvodb/LinvodbHelper";
import { KitsuLogin } from "apis/kitsu/kitsu-auth";

import SyncSettingsDialog from "./SyncSettingsDialog";
import { useSnackbar } from "notistack";
import useQueue from "hooks/useQueue";
import useSync from "hooks/useSync";

export default function Sync() {
  const { enqueueSnackbar } = useSnackbar();

  const [kitsuSyncSwitch, setKitsuSyncSwitch] = useState(false);
  const [kitsuCreds, setKitsuCreds] = useState(null);

  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleKitsuSyncSwitch = async () => {
    await ToggleSiteSync("kitsu", !kitsuSyncSwitch);
    setKitsuSyncSwitch(!kitsuSyncSwitch);
  };

  const handleSettingsOpen = () => {
    setSettingsOpen(true);
  };

  const handleSettingsClose = () => {
    setSettingsOpen(false);
  };

  const queue = useQueue();

  useEffect(() => {
    // Insert Kitsu genres on first use.
    GetGenreCount().then((count) => {
      if (count === 0) {
        console.log("First time");
        InsertKitsuGenres();
      } else {
        console.log("Not First Time");
      }
    });

    // Get sync status from db.
    GetPrimarySite().then(async (site) => {
      if (site.sync) {
        setKitsuSyncSwitch(site.sync);
      }
    });

    // EmptyQueue()
    // console.log(testQueue)
  }, []);

  // Login effect based on sync settings.
  useEffect(() => {
    async function Login() {
      try {
        const site = await GetPrimarySite();
        const creds = await KitsuLogin(site.userName, site.password);
        creds.userId = site.userId;
        console.log("KITSU_CREDS: " + JSON.stringify(creds));
        setKitsuCreds(creds);
      } catch (error) {
        console.error(error);
        enqueueSnackbar(error, { variant: "error" });
      }
    }
    if (kitsuSyncSwitch) {
      Login();
    }
  }, [kitsuSyncSwitch]);

  useSync(queue, kitsuCreds, kitsuSyncSwitch);

  return (
    <div>
      {/* <Divider/> */}
      <List>
        <ListItem key="Sync">
          <ListItemText primary="Sync" />
          <IconButton size="small" onClick={handleSettingsOpen}>
            <Settings />
          </IconButton>
        </ListItem>

        <ListItem style={{ paddingLeft: "2em" }}>
          <ListItemText primary="Kitsu" />
          <IconButton size="small" onClick={handleKitsuSyncSwitch}>
            {kitsuSyncSwitch ? <SyncOutlined /> : <SyncDisabled />}
          </IconButton>
        </ListItem>
      </List>

      {settingsOpen && (
        <SyncSettingsDialog
          open={settingsOpen}
          onClose={handleSettingsClose}
          setKitsuSyncSwitch={setKitsuSyncSwitch}
          setKitsuCreds={setKitsuCreds}
        />
      )}
    </div>
  );
}
