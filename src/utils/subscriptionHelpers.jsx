// utils/subscriptionHelpers.js

/**
 * تحويل الوقت لدقائق للمقارنة
 */
export const timeToMinutes = (time) => {
  if (!time) return 0;
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + (minutes || 0);
};

/**
 * تحويل الدقائق لصيغة HH:MM
 */
export const minutesToHHMM = (minutes) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

/**
 * تحويل الوقت لصيغة HH:MM
 */
export const toHHMM = (time) => {
  if (!time) return "";
  return time.substring(0, 5);
};

/**
 * تحويل الوقت لصيغة HH:MM:SS
 */
export const toHHMMSS = (time) => {
  if (!time) return "";
  if (time.length === 5) return `${time}:00`;
  return time;
};

/**
 * تحويل من 24 ساعة إلى 12 ساعة
 */
export const format24to12 = (time) => {
  if (!time) return "";
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${String(minutes).padStart(2, "0")} ${period}`;
};

/**
 * التحقق من تعارض slot مع reserved slots
 */
export const isSlotConflicting = (
  slot,
  reservedSlots,
  excludeGroupId = null
) => {
  const slotDay = slot.day_of_week;
  const slotStart = timeToMinutes(toHHMM(slot.start_time));
  const slotEnd = timeToMinutes(toHHMM(slot.end_time));

  return reservedSlots.some((reserved) => {
    // استثناء الـ group الحالي من الفحص
    if (
      excludeGroupId &&
      String(reserved.group_id) === String(excludeGroupId)
    ) {
      return false;
    }

    if (reserved.day_of_week !== slotDay) return false;

    const reservedStart = timeToMinutes(toHHMM(reserved.start_time));
    const reservedEnd = timeToMinutes(toHHMM(reserved.end_time));

    // التحقق من التداخل
    return (
      (slotStart >= reservedStart && slotStart < reservedEnd) ||
      (slotEnd > reservedStart && slotEnd <= reservedEnd) ||
      (slotStart <= reservedStart && slotEnd >= reservedEnd)
    );
  });
};

/**
 * التحقق من تعارض جميع المواعيد المطلوبة
 */
export const checkSlotsAvailability = (
  requestedSlots,
  reservedSlots,
  excludeGroupId = null
) => {
  const conflicts = [];
  const available = [];

  requestedSlots.forEach((slot) => {
    const hasConflict = isSlotConflicting(slot, reservedSlots, excludeGroupId);
    if (hasConflict) {
      conflicts.push(slot);
    } else {
      available.push(slot);
    }
  });

  return {
    allAvailable: conflicts.length === 0,
    conflicts,
    available,
    hasAnyConflict: conflicts.length > 0,
  };
};

export const DAY_ORDER = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
