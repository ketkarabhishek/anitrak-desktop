import React, {useState, useEffect} from 'react';
import AnimeCount from './AnimeCount';
import CategoryStats from './CategoryStats';
import { Grid, Typography, Card } from '@material-ui/core';
import {GetTotalWatchTime} from '../../db/linvodb/LinvodbHelper';


export default function KitsuStats(){
    const[total, setTime] = useState("");

    useEffect(() => {
        async function getData(){
            const time = await GetTotalWatchTime();
            setTime(time);
        }
        getData();
    }, [])

    return(
        <div>
            <Grid container>
                <Grid item lg={6} md={12}><Card style={{marginTop: 10, marginRight:10}}><AnimeCount></AnimeCount></Card></Grid>
                <Grid item lg={6} md={12}><Card style={{marginTop: 10, marginRight:10}}><CategoryStats></CategoryStats></Card></Grid>
            </Grid>

            
            
            
            <Grid container>
                <Grid item lg={6} md={6}>
                    <Card style={{marginTop: 10, marginRight: 10, marginBottom: 10, padding: 10}}>
                        <Typography variant="h5" align="center">Watchtime</Typography>
                        <Typography variant="h3" color="secondary" align="center">{total.totalTime}</Typography>
                    </Card>
                </Grid>
                <Grid item lg={6} md={6}>
                    <Card style={{marginTop: 10, marginRight: 10, marginBottom: 10, padding: 10}}>
                        <Typography variant="h5" align="center">Episodes</Typography>
                        <Typography variant="h3" color="secondary" align="center">{total.totalEp}</Typography>
                    </Card>
                </Grid>
            </Grid>
            
            
        </div>
    )
    
}