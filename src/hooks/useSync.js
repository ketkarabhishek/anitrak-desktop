import { useEffect } from "react";
import {
  CreateKitsuEntry,
  UpdateKitsuEntry,
  DeleteKitsuEntry,
} from "apis/kitsu/Library";
import {
  AddKitsuDetails,
  ToggleQueueItemStatus,
} from "db/linvodb/LinvodbHelper";
import { DELETE, UPDATE, CREATE } from "constants/QueueConstants";

export default function useSync(queue, kitsuCreds, kitsuSync) {
  useEffect(() => {
    try {
      if (kitsuSync && queue.length) {
        queue.forEach(async (item) => {
          let response = null;
          switch (item.type) {
            case CREATE:
              response = await CreateKitsuEntry(kitsuCreds, item.data);
              console.log("KITSU_CREATE_RES: " + JSON.stringify(response));
              AddKitsuDetails(item.data.id, response);
              ToggleQueueItemStatus(item._id);

              break;

            case UPDATE:
              response = await UpdateKitsuEntry(kitsuCreds, item.data);
              console.log("KITSU_UPDATE_RES: " + JSON.stringify(response));
              ToggleQueueItemStatus(item._id);

              break;

            case DELETE:
              await DeleteKitsuEntry(kitsuCreds, item.data);
              ToggleQueueItemStatus(item._id);

              break;

            default:
              break;
          }
        });
      }
    } catch (error) {
      console.error(error);
    }
  }, [queue, kitsuSync, kitsuCreds]);
}
