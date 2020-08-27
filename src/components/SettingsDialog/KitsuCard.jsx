import React, { useState, useEffect } from "react"
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Avatar,
  Typography,
  Grid,
  CircularProgress,
} from "@material-ui/core"
import {
  Add,
  CloudDownloadOutlined,
  DeleteOutlineOutlined,
} from "@material-ui/icons"
import { ReactComponent as KitsuLogo } from "images/kitsu.svg"
import KitsuSettingsDialog from "./KitsuLoginDialog"
import { getDatabase } from "db/rxdb"
import DataDisplay from "components/DataDisplay/DataDisplay"

export default function KitsuCard() {
  const [loginOpen, setLoginOpen] = useState(false)
  const [kitsuData, setKitsuData] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let sub = null
    async function getData() {
      const db = await getDatabase()
      sub = db.website
        .findOne({ selector: { siteName: "kitsu" } })
        .$.subscribe((website) => {
          setKitsuData(website)
          console.log(website)
          setLoading(false)
        })
    }

    getData()
    return () => {
      if (sub != null) {
        sub.unsubscribe()
      }
    }
  }, [])
  return (
    <Card>
      <CardHeader
        avatar={<KitsuLogo style={{ width: "50%", height: "auto" }} />}
      />
      <DataDisplay
        loading={loading}
        loadingComponent={
          <Grid container justify="center" alignItems="center">
            <CircularProgress style={{ margin: "20px 0" }} />
          </Grid>
        }
      >
        <CardContent style={{ listStyleType: "none" }}>
          {kitsuData ? (
            <div>
              <Grid
                container
                justify="center"
                direction="column"
                alignItems="center"
              >
                <Avatar
                  src={kitsuData.avatar}
                  style={{ width: "150px", height: "150px" }}
                />

                <Typography variant="h3">{kitsuData.userName}</Typography>
                <Typography variant="subtitle1">{kitsuData.userId}</Typography>
                <Grid
                  container
                  justify="center"
                  alignItems="center"
                  direction="row"
                >
                  <Button
                    variant="outlined"
                    color="primary"
                    style={{ margin: "20px" }}
                    startIcon={<CloudDownloadOutlined />}
                  >
                    Import Kitsu Library
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<DeleteOutlineOutlined />}
                  >
                    Delete Account
                  </Button>
                </Grid>
              </Grid>
            </div>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={() => setLoginOpen(true)}
              startIcon={<Add />}
            >
              Add Account
            </Button>
          )}
        </CardContent>
      </DataDisplay>
      {loginOpen && (
        <KitsuSettingsDialog
          open={loginOpen}
          onClose={() => setLoginOpen(false)}
        />
      )}
    </Card>
  )
}
