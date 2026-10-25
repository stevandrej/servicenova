export interface Links {
    label: string;
    /** Omitted for entries that only run an action, which render as buttons. */
    href?: string;
    icon: React.JSX.Element | React.ReactNode;
    action?: () => void;
  }
