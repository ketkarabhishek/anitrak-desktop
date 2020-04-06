import React, {useState, useEffect} from 'react';
import {Dialog, DialogTitle, DialogContent, Grid, Typography, Divider, Chip, IconButton} from '@material-ui/core';
import {GetGenres} from '../../db/linvodb/LinvodbHelper';
import { Close } from '@material-ui/icons';

export default function AnimeInfoDialog(props) {
    const[categories, setCategories] = useState([]);
    const[season, setSeason] = useState("");

    useEffect(() => {
        let cancel = false;
        async function getData(){
            const date = new Date(props.data.airDate);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            if(month <= 3){
                setSeason("Winter " + year);
            }
            else if(month > 3 && month <= 6){
                setSeason("Spring " + year);
            }
            else if(month > 6 && month <= 9){
                setSeason("Summer " + year);
            }
            else{
                setSeason("Fall " + year);
            }
            const genres = await GetGenres(props.data.categories);
            
            if(cancel === false){
                setCategories(genres);
            }
        }
        if(cancel === false){
            getData();
        }
        
        return () => {cancel = true}
    }, [])
    return (
        <div>
             <Dialog open={props.open} onClose={props.handleClose} maxWidth="md" fullWidth disableEnforceFocus>
                <DialogTitle>
                    
                    <Grid container justify="space-between">
                        <Typography variant="h6">{props.data.title}</Typography>
                        <IconButton onClick={props.handleClose} size="small"><Close/> </IconButton>
                    </Grid>
                </DialogTitle>
                <DialogContent dividers>
                    <Grid container>
                        <Grid item sm={4}>
                            <img src={props.data.posterUrl} alt="Cowboy"/>
                            <Grid container>
                                <Grid item sm={4}>
                                    <Typography variant="subtitle2" color="primary">Episodes</Typography>
                                    <Typography variant="h6">{props.data.total}</Typography>
                                </Grid>
                                <Grid item sm={4}>
                                    <Typography variant="subtitle2" color="primary">Type</Typography>
                                    <Typography variant="h6">{props.data.showType}</Typography>
                                </Grid>
                                <Grid item sm={4}>
                                    <Typography variant="subtitle2" color="primary">Avg. Rating</Typography>
                                    <Typography variant="h6">{props.data.averageRating}</Typography>
                                </Grid>
                                <Grid item sm={6}>
                                    <Typography variant="subtitle2" color="primary">Season</Typography>
                                    <Typography variant="h6">{season}</Typography>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item sm={8}>

                            <Typography variant="h6">Categories</Typography>
                            <Divider style={{marginBottom: '10px'}}></Divider>
                            {categories.map((value) => (
                                <Chip style={{marginRight: '10px', marginBottom: '10px'}} 
                                key={value.slug} label={value.title} size="small" color="primary" />
                            ))}
                            <Typography variant="h6">Synopsis</Typography>
                            <Divider style={{marginBottom: '10px'}}></Divider>
                            <Typography variant="body1">{props.data.synopsis}</Typography>                            
                        </Grid>
                    </Grid>
                    
                </DialogContent>
             </Dialog>
            
        </div>
    )
}
