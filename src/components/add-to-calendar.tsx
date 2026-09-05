import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/react";
import { IconCalendarPlus, IconBrandGoogle, IconCalendar } from "@tabler/icons-react";

interface AddToCalendarProps {
  date: Date;
  vehicleMake: string;
  vehicleModel: string;
  vehiclePlate?: string;
}

/** YYYYMMDD, the form an all-day VALUE=DATE event takes. */
const toIcsDate = (date: Date) =>
  date.toISOString().replace(/[-:]/g, "").split("T")[0];

/** YYYYMMDDTHHMMSSZ, required for DTSTAMP. */
const toIcsDateTime = (date: Date) =>
  date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

const generateIcsFile = (
  title: string,
  date: Date,
  description: string = "",
  fileName: string = "service-reminder.ics"
) => {
  const startDate = toIcsDate(date);
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);
  const endDate = toIcsDate(nextDay);

  const icsString = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Service Nova//EN",
    "BEGIN:VEVENT",
    // Some clients (Outlook in particular) reject an event with no UID or
    // DTSTAMP, and a stable UID lets a re-export update the event in place
    // rather than creating a duplicate.
    `UID:${startDate}-${title.replace(/\s+/g, "-")}@service-nova`,
    `DTSTAMP:${toIcsDateTime(new Date())}`,
    `DTSTART;VALUE=DATE:${startDate}`,
    `DTEND;VALUE=DATE:${endDate}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    // Without a VALARM the entry is a silent diary note - the calendar never
    // actually reminds anyone.
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    `DESCRIPTION:${title}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
    // RFC 5545 requires CRLF line endings; some clients are strict about it.
  ].join("\r\n");

  const blob = new Blob([icsString], { type: "text/calendar;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

const openGoogleCalendar = (title: string, date: Date, description: string = "") => {
  const startDate = toIcsDate(date);
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);
  const endDate = toIcsDate(nextDay);
  
  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(description)}`;
  window.open(url, "_blank");
};

export const AddToCalendar = ({ date, vehicleMake, vehicleModel, vehiclePlate }: AddToCalendarProps) => {
  const title = `Service Reminder: ${vehicleMake} ${vehicleModel}`;
  const description = `This is an automated reminder from Service Nova to check or service your ${vehicleMake} ${vehicleModel}.`;
  // Every vehicle used to download the same "service-reminder.ics", so a second
  // export landed as "service-reminder (1).ics" with nothing to tell them apart.
  const fileName = `service-${(vehiclePlate || `${vehicleMake}-${vehicleModel}`)
    .replace(/[^a-z0-9]+/gi, "-")
    .toLowerCase()}.ics`;

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button 
          size="sm" 
          variant="flat" 
          color="primary" 
          startContent={<IconCalendarPlus size={16} />}
        >
          Add to Calendar
        </Button>
      </DropdownTrigger>
      <DropdownMenu 
        aria-label="Calendar Options"
        onAction={(key) => {
          if (key === "google") openGoogleCalendar(title, date, description);
          if (key === "ics") generateIcsFile(title, date, description, fileName);
        }}
      >
        <DropdownItem 
          key="google" 
          startContent={<IconBrandGoogle size={18} />}
        >
          Google Calendar
        </DropdownItem>
        <DropdownItem 
          key="ics" 
          startContent={<IconCalendar size={18} />}
        >
          Apple / Outlook / Other
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};
