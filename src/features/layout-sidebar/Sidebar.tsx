"use client";
import React from "react";
import { SidebarProvider } from "./SidebarProvider";
import { SidebarLink } from "./SidebarLink";
import { useSidebarLinks } from "./useSidebarLinks.data";
import { SidebarBody } from "./SidebarBody";

export const Sidebar = ({
  open,
  setOpen,
  animate,
}: {
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {

  const links = useSidebarLinks();

  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      <SidebarBody className="justify-between gap-10">
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mt-8 flex flex-col gap-2">
            {links.map((link, idx) => (
              <SidebarLink key={idx} link={link} />
            ))}
          </div>
        </div>
        <div>
          <SidebarLink
            link={{
              label: "Manu Arora",
              href: "#",
              icon: <></>,
            }}
          />
        </div>
      </SidebarBody>
    </SidebarProvider>
  );
};
