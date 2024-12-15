export const getStatusColorClasses = (nextService?: Date) => {
  if (!nextService) return "bg-white";

  const today = new Date();
  const monthsDiff =
    (nextService.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30);

  if (monthsDiff <= 1) {
    return "bg-red-50";
  } else if (monthsDiff <= 3) {
    return "bg-orange-50";
  }
  return "bg-green-50";
};
