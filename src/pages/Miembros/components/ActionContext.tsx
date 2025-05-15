import { createContext } from "react";

interface ActionContextProps {
    editMember?: (id: number) => void | undefined;
    handleOpenDialog?: (id: number) => void | undefined;
}

export const ActionContext = createContext<ActionContextProps>({
    editMember: undefined,
    handleOpenDialog: undefined,
});