import { getServiceUrgency } from "../../utils/serviceDue";

/**
 * Card tint by how close the next service is. Overdue is deliberately distinct
 * from due-soon - they used to share the same red, so a vehicle three months
 * late looked no different from one due next week.
 */
export const getStatusColorClasses = (nextService?: Date) => {
  switch (getServiceUrgency(nextService)) {
    case "overdue":
      return "bg-red-100";
    case "due-soon":
      return "bg-orange-50";
    case "upcoming":
      return "bg-amber-50";
    case "ok":
      return "bg-green-50";
    default:
      return "bg-white";
  }
};
