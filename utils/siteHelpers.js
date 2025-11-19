export const getTodayName = () => {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[new Date().getDay()];
};
export const calculateDuration = (openingTime, closingTime) => {
  if (!openingTime || !closingTime) return "Closed";
  const [openHour, openMinute] = openingTime.split(":").map(Number);
  const [closeHour, closeMinute] = closingTime.split(":").map(Number);
  const openDate = new Date();
  openDate.setHours(openHour, openMinute, 0, 0);
  const closeDate = new Date();
  closeDate.setHours(closeHour, closeMinute, 0, 0);
  if (closeDate <= openDate) {
    closeDate.setDate(closeDate.getDate() + 1);
  }
  const diffMs = closeDate - openDate;
  const hours = Math.floor(diffMs / 3600000);
  const minutes = Math.floor((diffMs % 3600000) / 60000);
  if (hours && minutes) return `${hours} hrs ${minutes} mins`;
  if (hours) return `${hours} hr${hours > 1 ? "s" : ""}`;
  if (minutes) return `${minutes} min${minutes > 1 ? "s" : ""}`;
  return "Closed";
};
export const getDurationOnly = (gallery) => {
  const today = getTodayName();
  const hours = gallery?.openingHours || [];
  const todayHours = hours.find((h) => h.day === today);
  if (!todayHours) return "Closed";
  const duration = calculateDuration(todayHours.opening, todayHours.closing);
  return duration;
};
export const formatTime = (time24) => {
  if (!time24) return "";
  const [hourStr, minuteStr] = time24.split(":");
  let hour = parseInt(hourStr);
  const minute = minuteStr || "00";
  const period = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minute}${period}`;
};
export const getOpeningTimeForToday = (site) => {
  const today = getTodayName();
  const hours = site.openingHours || [];
  const todayHours = hours.find((h) => h.day === today);
  if (!todayHours) return "Closed today";
  const open = formatTime(todayHours.opening);
  const close = formatTime(todayHours.closing);
  return `${open} To ${close}`;
};
export const combineDateAndTime = (date, time) => {
  if (!date || !time) return null;
  const [year, month, day] = date.split("-");
  const [hours, minutes] = time.split(":");
  const dateTime = new Date(year, month - 1, day, hours, minutes, 0);
  if (isNaN(dateTime.getTime())) {
    console.error("Invalid date or time format provided.");
    return null;
  }
  return dateTime.toISOString().slice(0, 19);
};
export const convertTo24Hour = (time12h) => {
  const [time, modifier] = time12h.split(" ");
  let [hours, minutes, seconds] = time.split(":");
  if (hours === "12") {
    hours = "00";
  }
  if (modifier === "PM") {
    hours = String(parseInt(hours, 10) + 12);
  }
  return `${hours.padStart(2, "0")}:${minutes}:${seconds}`;
};
export const getFormattedTodayHours = (gallery) => {
  const today = getTodayName(); // From your existing code
  const openingHours = gallery?.openingHours || [];
  const todayHours = openingHours.find((h) => h.day === today);
  if (!todayHours || !todayHours.opening || !todayHours.closing) {
    return "Closed today";
  }
  const openTime = formatTime(todayHours.opening); // From your formatTime function
  const closeTime = formatTime(todayHours.closing);
  return `${openTime} To ${closeTime}`;
};

export const mergeSiteWithItem = (site, item = {}) => ({
  _id: site?._id || item?.siteId || item?._id || "",
  name: site?.name || item?.siteName || "",
});
