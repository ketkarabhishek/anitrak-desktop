import React, {useState, useEffect} from 'react'
import { ListItem, ListItemText, List, IconButton } from '@material-ui/core'
import { SyncOutlined, SyncDisabled, MoreVert } from '@material-ui/icons'
import { GetPrimarySite, Queue, AddKitsuDetails, ToggleQueueItemStatus, ToggleSiteSync, GetGenreCount, InsertKitsuGenres } from 'db/linvodb/LinvodbHelper'
import { KitsuLogin } from 'apis/kitsu/kitsu-auth'
import { CREATE, UPDATE, DELETE } from 'constants/QueueConstants'
import {CreateKitsuEntry, UpdateKitsuEntry, DeleteKitsuEntry} from 'apis/kitsu/Library';
import SyncSettingsDialog from './SyncSettingsDialog'
import { useSnackbar } from 'notistack'

export default function Sync() {

    const {enqueueSnackbar} = useSnackbar()

    const [kitsuSyncSwitch, setKitsuSyncSwitch] = useState(false)
    const [kitsuCreds, setKitsuCreds] = useState(null)
    const [queue, setQueue] = useState([])

    const [settingsOpen, setSettingsOpen] = useState(false)

    const handleKitsuSyncSwitch = async () => {
        await ToggleSiteSync("kitsu", !kitsuSyncSwitch)
        setKitsuSyncSwitch(!kitsuSyncSwitch)
    }

    const handleSettingsOpen = () => {
        setSettingsOpen(true)
    }

    const handleSettingsClose = () => {
        setSettingsOpen(false)
    }


    // Set listener on queue db.
    function SubscribeQueue(){
        const queueLive = Queue.find({isSynced: false}).live();
        Queue.on("liveQueryUpdate", () => {
            //console.log("QUEUE: " + queueLive.res);
            if(queueLive.res != null){
                console.log("Queue listener");
                setQueue(queueLive.res)
            }
                
            
        });
        
    }


    // Sync items in the queue.
    function SyncQueue(items){
        if(kitsuSyncSwitch){
            items.forEach(async item => {
                switch (item.type) {
                    case CREATE:
                        try {
                            const response = await CreateKitsuEntry(kitsuCreds, item.data)
                            console.log("KITSU_CREATE_RES: " + JSON.stringify(response))
                            AddKitsuDetails(item.data.id, response)
                            ToggleQueueItemStatus(item._id)
                        } catch (error) {
                            console.error(error)
                        }
                        
                        break;

                    case UPDATE:
                        try {
                            const response = await UpdateKitsuEntry(kitsuCreds, item.data)
                            console.log("KITSU_UPDATE_RES: " + JSON.stringify(response))
                            ToggleQueueItemStatus(item._id)

                        } catch (error) {
                            console.error(error)
                        }
                    
                        break;

                    case DELETE:
                        try {
                            await DeleteKitsuEntry(kitsuCreds, item.data)
                            ToggleQueueItemStatus(item._id)
                        } catch (error) {
                            console.error(error)
                        }
                    
                        break;
                
                    default:
                        break;
                }
            });
        }
    }

    useEffect(() => {

        // Insert Kitsu genes on first use.
        GetGenreCount().then((count) => {
            if(count === 0){
                console.log("First time");
                InsertKitsuGenres();
            }
            else{
                console.log("Not First Time");
            }
        })

        // Get sync status from db.
        GetPrimarySite().then(async(site) => {
            if(site.sync){
                setKitsuSyncSwitch(site.sync)
            }
        })

        // Subscribe to sync queue listener.
        SubscribeQueue()

        // EmptyQueue()
       
    }, [])

    // Login effect based on sync settings. 
    useEffect(() => {
        async function Login(){
            try {
                const site = await GetPrimarySite();
                const creds = await KitsuLogin(site.userName, site.password)
                creds.userId = site.userId
                console.log("KITSU_CREDS: " + JSON.stringify(creds))
                setKitsuCreds(creds)
            } catch (error) {
                console.error(error);
                enqueueSnackbar(error, {variant: 'error'})
            }
            
        }
        if(kitsuSyncSwitch){
            Login()
        }
    }, [kitsuSyncSwitch])


    // Sync queue after queue update
    useEffect(() => {
        if(kitsuSyncSwitch && kitsuCreds){
            SyncQueue(queue)
            console.log("Sync Queue");
            // replaceLibrary(kitsuCreds)
            
        }

    }, [queue, kitsuSyncSwitch, kitsuCreds])




    return (
        <div>
            {/* <Divider/> */}
            <List>
                
                <ListItem key="Sync">
                    <ListItemText primary="Sync" />
                    <IconButton size="small" onClick={handleSettingsOpen}>
                        <MoreVert/>
                    </IconButton>
                </ListItem>

                <ListItem style={{paddingLeft: '2em'}}>
                    <ListItemText primary="Kitsu" />
                    <IconButton size="small" onClick={handleKitsuSyncSwitch}>
                        {kitsuSyncSwitch ? <SyncOutlined/> : <SyncDisabled/>}
                    </IconButton>
                    
                </ListItem>
                
            </List>
            
            {settingsOpen && <SyncSettingsDialog open={settingsOpen} onClose={handleSettingsClose} 
                setKitsuSyncSwitch = {setKitsuSyncSwitch} setKitsuCreds={setKitsuCreds} />}
            
        </div>
    )
}
