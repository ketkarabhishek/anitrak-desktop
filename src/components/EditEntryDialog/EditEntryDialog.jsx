import React, { useState } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  MenuItem,
  Typography,
  DialogActions,
  Button,
  IconButton,
  Grid,
} from "@material-ui/core"
import { useSnackbar } from "notistack"

import { Close, DeleteForever } from "@material-ui/icons"
import { useConfirm } from "material-ui-confirm"
import { addSyncTaskToQueue } from "db/rxdb/utils"
import { DELETE, UPSERT } from "apis/constants"

export default function EditEntryDialog(props) {
  const confirm = useConfirm()
  const { enqueueSnackbar } = useSnackbar()

  const [status, setStatus] = useState(props.data.status)
  const [progress, setProgress] = useState(props.data.progress)
  const [rating, setRating] = useState(props.data.ratingTwenty / 2)

  const statusList = [
    {
      value: "current",
      label: "Current",
    },
    {
      value: "completed",
      label: "Completed",
    },
    {
      value: "planned",
      label: "Planned",
    },
  ]

  const ratings = [
    0,
    1,
    1.5,
    2,
    2.5,
    3,
    3.5,
    4,
    4.5,
    5,
    5.5,
    6,
    6.5,
    7,
    7.5,
    8,
    8.5,
    9,
    9.5,
    10,
  ]

  function handleStatus(e) {
    setStatus(e.target.value)
  }

  function handleProgress(e) {
    const value = e.target.value
    if (props.data.totalEpisodes < 1 && value >= 0) {
      setProgress(value)
    } else {
      if (value <= props.data.totalEpisodes && value >= 0) {
        setProgress(value)
      }
    }
  }

  function handleRating(e) {
    setRating(e.target.value)
    console.log(e.target.value)
  }

  async function handleSave() {
    await props.data.update({
      $set: {
        status: status,
        progress: parseInt(progress),
        ratingTwenty: rating * 2,
        updatedAt: new Date().toISOString(),
      },
    })

    await addSyncTaskToQueue(UPSERT, props.data.id)
    enqueueSnackbar("Updated " + props.data.title, { variant: "success" })
    props.handleClose()
  }

  function handleDelete() {
    confirm({
      title: "Delete Entry",
      description: "Are you sure you want to delete " + props.data.title + "?",
      confirmationButtonProps: { variant: "contained" },
      confirmationText: "Delete",
    }).then(async () => {
      const ids = { kitsuId: props.data.kitsuId, malId: props.data.malId }
      await props.data.remove()
      await addSyncTaskToQueue(DELETE, ids)
      enqueueSnackbar("Deleted " + props.data.title, {
        variant: "success",
      })
      props.handleClose()
    })
  }

  return (
    <Dialog
      open={props.open}
      onClose={props.handleClose}
      maxWidth="xs"
      fullWidth
      disableEnforceFocus
    >
      <DialogTitle>
        <Grid container justify="space-between">
          <Typography variant="h6" noWrap style={{ width: "80%" }}>
            {props.data.title}
          </Typography>
          <IconButton onClick={props.handleClose} size="small">
            <Close />{" "}
          </IconButton>
        </Grid>
      </DialogTitle>
      <DialogContent dividers>
        <TextField
          variant="outlined"
          select
          label="Status"
          value={status}
          margin="normal"
          fullWidth
          onChange={handleStatus}
        >
          {statusList.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          variant="outlined"
          label="Progress"
          fullWidth
          type="number"
          value={progress}
          min={0}
          InputProps={{
            endAdornment: (
              <Typography style={{ width: "50%" }} align="center">
                of{" "}
                {props.data.totalEpisodes < 1 ? "?" : props.data.totalEpisodes}{" "}
                Episodes
              </Typography>
            ),
          }}
          onChange={handleProgress}
        ></TextField>

        <TextField
          variant="outlined"
          select
          label="Rating"
          value={rating}
          margin="normal"
          fullWidth
          onChange={handleRating}
        >
          {ratings.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
      </DialogContent>
      <DialogActions>
        <Grid container justify="space-between" alignItems="center">
          <IconButton onClick={handleDelete}>
            <DeleteForever />
          </IconButton>
          <Button color="secondary" variant="contained" onClick={handleSave}>
            Save
          </Button>
        </Grid>
      </DialogActions>
    </Dialog>
  )
}
