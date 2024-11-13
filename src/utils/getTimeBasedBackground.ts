export const getTimeBasedBackground = () => {
  const hour = new Date().getHours();

  // Dawn (5-7)
  if (hour >= 5 && hour < 7) {
    return "bg-gradient-to-b from-indigo-500/30 via-purple-400/25 to-pink-300/20";
  }
  // Morning (7-11)
  if (hour >= 7 && hour < 11) {
    return "bg-gradient-to-b from-sky-300/40 via-blue-200/30 to-cyan-100/20";
  }
  // Noon (11-16)
  if (hour >= 11 && hour < 16) {
    return "bg-gradient-to-b from-blue-300/30 via-sky-200/25 to-cyan-100/20";
  }
  // Afternoon (16-19)
  if (hour >= 16 && hour < 19) {
    return "bg-gradient-to-b from-orange-200/40 via-amber-100/30 to-yellow-50/20";
  }
  // Dusk (19-21)
  if (hour >= 19 && hour < 21) {
    return "bg-gradient-to-b from-purple-400/30 via-violet-300/25 to-fuchsia-200/20";
  }
  // Night (21-5)
  return "bg-gradient-to-b from-slate-700/30 via-gray-600/25 to-zinc-500/20";
}; 