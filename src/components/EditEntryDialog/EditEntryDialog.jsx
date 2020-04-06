import React, {useState} from 'react';
import {Dialog, DialogTitle, DialogContent, TextField, MenuItem, Typography, DialogActions, Button, IconButton, Grid} from '@material-ui/core';
import { useSnackbar } from 'notistack';

import {EditLibEntry, DeleteLibEntry} from '../../db/linvodb/LinvodbHelper';
import { Close, DeleteForever } from '@material-ui/icons';
import { useConfirm } from 'material-ui-confirm';

export default function EditEntryDialog(props){
    const confirm = useConfirm()
    const { enqueueSnackbar } = useSnackbar()

    const[status, setStatus] = useState(props.data.status)
    const[progress, setProgress] = useState(props.data.progress)
    const[rating, setRating] = useState(props.data.ratingTwenty/2)

    const statusList = [
        {
            value: "current",
            label: "Current"
        },
        {
            value: "completed",
            label: "Completed"
        },
        {
            value: "planned",
            label: "Planned"
        },
    ]

    const ratings = [0, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10];
    
    // useEffect(() => {
        
    // }, [props])

    function handleStatus(e){
        setStatus(e.target.value);
    }

    function handleProgress(e){
        if(e.target.value > -1 && e.target.value <= props.data.total){
            setProgress(e.target.value);
            if(e.target.value === props.data.total){
                setStatus("completed");
            }
            else{
                setStatus("current")
            }
        }
        
    }

    function handleRating(e){
        setRating(e.target.value);
        console.log(e.target.value)
    }

    function handleSave(){
        let newData = props.data;
        newData.status = status;
        newData.progress = progress;
        if(rating === 0){
            newData.ratingTwenty = null;
        }
        else{
            newData.ratingTwenty = rating * 2;
        }
        
        EditLibEntry(newData).then(() => {
            props.handleClose();
        }).catch((err) => {
            enqueueSnackbar(err, {variant: "error"});
        })
    }

    function handleDelete(){
        confirm({
            title: "Delete Entry", 
            description: "Are you sure you want to delete " + props.data.title + "?",
            confirmationButtonProps: {variant: "contained"},
            confirmationText: "Delete",
        }).then(() => {
            DeleteLibEntry(props.data.kitsuEntryId).then(() => {
                console.log("REMOVED")
                props.handleClose();
            }).catch((err) => {
                enqueueSnackbar(err, {variant: "error"});
            })
        })
        
    }

    return(
        <Dialog open={props.open} onClose={props.handleClose} maxWidth="xs" fullWidth disableEnforceFocus>
            <DialogTitle>
            <Grid container justify="space-between">
                <Typography variant="h6" noWrap style={{width: '80%'}}>{props.data.title}</Typography>
                <IconButton onClick={props.handleClose} size="small"><Close/> </IconButton>
            </Grid>
            </DialogTitle>
            <DialogContent dividers>
                <TextField variant="outlined" select label="Status" value={status} margin="normal" fullWidth onChange={handleStatus}>
                    {statusList.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                        {option.label}
                    </MenuItem>
                    ))}
                </TextField>

                <TextField variant="outlined" label="Progress" fullWidth type="number" value={progress}
                InputProps={{
                endAdornment: <Typography style={{width: '50%'}} align="center">of {props.data.total} Episodes</Typography>
                }} onChange={handleProgress}>
                </TextField>

                <TextField variant="outlined" select label="Rating" value={rating} margin="normal" fullWidth onChange={handleRating}>
                    {ratings.map(option => (
                    <MenuItem key={option} value={option}>
                        {option}
                    </MenuItem>
                    ))}
                </TextField>
               
            </DialogContent>
            <DialogActions>
                <Grid container justify="space-between" alignItems="center">
                    <IconButton onClick={handleDelete}><DeleteForever/></IconButton>
                    <Button color="secondary" variant="contained" onClick={handleSave}>Save</Button>
                    
                </Grid>
               
                
            </DialogActions>
        </Dialog>
    )
}
