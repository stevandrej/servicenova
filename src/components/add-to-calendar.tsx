import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/react";
import { IconCalendarPlus, IconBrandGoogle, IconCalendar } from "@tabler/icons-react";

interface AddToCalendarProps {
  date: Date;
  vehicleMake: string;
  vehicleModel: string;
}

const generateIcsFile = (title: string, date: Date, description: string = "") => {
  const startDate = date.toISOString().replace(/[-:]/g, "").split("T")[0];
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);
  const endDate = nextDay.toISOString().replace(/[-:]/g, "").split("T")[0];

  const icsString = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Service Nova//EN",
    "BEGIN:VEVENT",
    `DTSTART;VALUE=DATE:${startDate}`,
    `DTEND;VALUE=DATE:${endDate}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\n");

  const blob = new Blob([icsString], { type: "text/calendar;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "service-reminder.ics");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const openGoogleCalendar = (title: string, date: Date, description: string = "") => {
  const startDate = date.toISOString().replace(/[-:]/g, "").split("T")[0];
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);
  const endDate = nextDay.toISOString().replace(/[-:]/g, "").split("T")[0];
  
  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(description)}`;
  window.open(url, "_blank");
};

export const AddToCalendar = ({ date, vehicleMake, vehicleModel }: AddToCalendarProps) => {
  const title = `Service Reminder: ${vehicleMake} ${vehicleModel}`;
  const description = `This is an automated reminder from Service Nova to check or service your ${vehicleMake} ${vehicleModel}.`;

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button 
          size="sm" 
          variant="flat" 
          color="primary" 
          startContent={<IconCalendarPlus size={16} />}
          onClick={(e) => e.stopPropagation()} // Prevent triggering parent onClick
        >
          Add to Calendar
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Calendar Options">
        <DropdownItem 
          key="google" 
          startContent={<IconBrandGoogle size={18} />}
          onPress={() => openGoogleCalendar(title, date, description)}
        >
          Google Calendar
        </DropdownItem>
        <DropdownItem 
          key="ics" 
          startContent={<IconCalendar size={18} />}
          onPress={() => generateIcsFile(title, date, description)}
        >
          Apple / Outlook / Other
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};
