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
  makeStyles,
} from "@material-ui/core"
import Rating from "@material-ui/lab/Rating"
import { useSnackbar } from "notistack"

import { Close, DeleteForever } from "@material-ui/icons"
import { useConfirm } from "material-ui-confirm"
import { addSyncTaskToQueue } from "db/rxdb/utils"
import { DELETE, UPSERT } from "apis/constants"

const useStyles = makeStyles({
  root: {
    display: "flex",
    alignItems: "center",
  },
})

export default function EditEntryDialog(props) {
  const confirm = useConfirm()
  const { enqueueSnackbar } = useSnackbar()
  const classes = useStyles()

  const [status, setStatus] = useState(props.data.status)
  const [progress, setProgress] = useState(props.data.progress)
  const [rating, setRating] = useState(props.data.ratingTwenty / 2 || null)

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

  function handleRating(e, v) {
    if (v < 1) {
      setRating(1)
    } else {
      setRating(v)
    }
    console.log(v)
  }

  const handleAddRating = () => {
    setRating(1)
  }

  const handleDeleteRating = () => {
    setRating(null)
  }

  async function handleSave() {
    await props.data.update({
      $set: {
        status: status,
        progress: parseInt(progress),
        ratingTwenty: rating * 2 || null,
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
                of {props.data.totalEpisodes ? props.data.totalEpisodes : "?"}{" "}
                Episodes
              </Typography>
            ),
          }}
          onChange={handleProgress}
        ></TextField>

        <Typography component="legend" variant="caption" color="textSecondary">
          Rating
        </Typography>
        {rating == null ? (
          <Button variant="outlined" onClick={handleAddRating} size="small">
            Add Rating
          </Button>
        ) : (
          <Grid container className={classes.root}>
            <Grid item md={9}>
              <Rating
                name="Rating"
                defaultValue={1}
                max={10}
                precision={0.5}
                size="large"
                onChange={handleRating}
                value={rating}
              />
            </Grid>
            <Grid item md={3}>
              <Typography
                style={{ paddingLeft: 8, paddingRight: 4 }}
                variant="body1"
                align="center"
              >
                {rating} / 10
              </Typography>
            </Grid>
            <Button
              variant="text"
              color="primary"
              size="small"
              onClick={handleDeleteRating}
            >
              Delete Rating
            </Button>
          </Grid>
        )}
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
