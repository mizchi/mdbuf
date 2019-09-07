import { WorkerAPI } from "../../types";
import React, { useContext } from "react";

export const WorkerAPIContext = React.createContext<WorkerAPI>(null as any);

export const useRemote = () => {
  return useContext(WorkerAPIContext);
};
