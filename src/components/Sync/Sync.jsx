import React, { useState, useEffect } from "react"

import {
  ListItem,
  ListItemText,
  List,
  IconButton,
  ListItemIcon,
  ListSubheader,
} from "@material-ui/core"
import { SyncOutlined, SyncDisabled, MoreVert } from "@material-ui/icons"

import { getDatabase } from "db/rxdb"
import useNetworkDetector from "hooks/useNetworkDetector"

// MAL
// import mal from "images/mal-icon.png"
// import Img from "react-image"
// import MalSettingsDialog from "./MalSettingsDialog"
// import useMalSync from "hooks/useMalSync"

// Kitsu
import KitsuSettingsDialog from "./KitsuSettingsDialog"
import useKitsuSync from "hooks/useKitsuSync"
import { ReactComponent as KitsuLogo } from "images/kitsu-icon.svg"
import KitsuApi from "kitsu-api-wrapper"

export default function Sync() {
  const [kitsuOpen, setKitsuOpen] = useState(false)
  // const [malOpen, setMalOpen] = useState(false)

  const handleKitsuSyncSwitch = async () => {
    const db = await getDatabase()
    const upsite = await db.website
      .findOne({ selector: { siteName: "kitsu" } })
      .update({
        $set: {
          sync: !kitsuSync,
        },
      })
    console.log(upsite)
  }

  // const handleMalSyncSwitch = async () => {
  //   const db = await getDatabase()
  //   const upsite = await db.website
  //     .findOne({ selector: { siteName: "mal" } })
  //     .update({
  //       $set: {
  //         sync: !malSync,
  //       },
  //     })
  //   console.log(upsite)
  // }

  const handleKitsuSettingsOpen = () => {
    setKitsuOpen(true)
  }

  // const handleMalOpen = () => {
  //   setMalOpen(true)
  // }

  //Hooks
  const isConnected = useNetworkDetector()
  const { kitsuSync } = useKitsuSync(isConnected)
  // const { malSync } = useMalSync(isConnected)

  //Effects
  useEffect(() => {
    // Insert Kitsu genres on first use.
    async function setup() {
      try {
        const db = await getDatabase()

        // Get Categories
        const cats = await db.categories.find().exec()
        if (cats.length === 0) {
          const kitsuApi = new KitsuApi()
          const query = kitsuApi.categories.fetch({ page: { limit: 300 } })
          const res = await query.exec()
          const categories = res.data.map((cat) => ({
            id: cat.id,
            title: cat.attributes.title,
          }))
          const catInsert = await db.categories.bulkInsert(categories)
          console.log(catInsert)
        }
      } catch (error) {
        console.error(error)
      }
    }

    setup()
  }, [isConnected])

  return (
    <div>
      <List subheader={<ListSubheader>Sync</ListSubheader>}>
        <ListItem>
          <ListItemIcon>
            <KitsuLogo style={{ width: 24, height: 24 }} />
          </ListItemIcon>
          <ListItemText primary="Kitsu" />
          <IconButton size="small" onClick={handleKitsuSyncSwitch}>
            {kitsuSync ? <SyncOutlined /> : <SyncDisabled />}
          </IconButton>
          <IconButton size="small" onClick={handleKitsuSettingsOpen}>
            <MoreVert />
          </IconButton>
        </ListItem>

        {/* <ListItem>
          <ListItemIcon>
            <Img src={mal} style={{ width: 24, height: 24 }} />
          </ListItemIcon>
          <ListItemText primary="MAL" />
          <IconButton size="small" onClick={handleMalSyncSwitch}>
            {malSync ? <SyncOutlined /> : <SyncDisabled />}
          </IconButton>
          <IconButton size="small" onClick={handleMalOpen}>
            <MoreVert />
          </IconButton>
        </ListItem> */}
      </List>

      {kitsuOpen && (
        <KitsuSettingsDialog
          open={kitsuOpen}
          onClose={() => setKitsuOpen(false)}
        />
      )}

      {/* {malOpen && (
        <MalSettingsDialog open={malOpen} onClose={() => setMalOpen(false)} />
      )} */}
    </div>
  )
}
