export const getStatusColorClasses = (nextService?: Date) => {
  if (!nextService) return "from-white text-black";

  const today = new Date();
  const monthsDiff =
    (nextService.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30);

  if (monthsDiff <= 1) {
    return "from-red-950 text-white";
  } else if (monthsDiff <= 3) {
    return "from-orange-700 text-white";
  }
  return "from-white text-black";
};
