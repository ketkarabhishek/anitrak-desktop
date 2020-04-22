import { useState, useEffect } from "react";
import { Queue } from "db/linvodb/LinvodbHelper";

export default function useQueue() {
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    const queueLive = Queue.find({ isSynced: false }).live();
    Queue.on("liveQueryUpdate", () => {
      //console.log("QUEUE: " + queueLive.res);
      if (queueLive.res != null) {
        setQueue(queueLive.res);
        console.log("INSIDE HOOK");
        console.log(queueLive.res);
      }
    });
  }, []);

  return queue;
}
