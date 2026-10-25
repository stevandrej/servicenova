import { useCallback, useState } from "react";
import { SidebarContext } from "./useSidebar";

const PINNED_KEY = "serviceNova:sidebarPinned";

const readPinned = () => {
  try {
    return localStorage.getItem(PINNED_KEY) === "true";
  } catch {
    // Private mode and blocked site data both throw here.
    return false;
  }
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);
  const [pinned, setPinnedState] = useState(readPinned);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  const setPinned = useCallback((next: boolean) => {
    setPinnedState(next);
    try {
      localStorage.setItem(PINNED_KEY, String(next));
    } catch {
      // Preference is a convenience; failing to persist it is not an error.
    }
  }, []);

  return (
    <SidebarContext.Provider
      value={{ open, setOpen, animate, pinned, setPinned }}
    >
      {children}
    </SidebarContext.Provider>
  );
};
