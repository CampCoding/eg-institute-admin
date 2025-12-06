export const timezoneOptions = [
  // UTC/GMT
  { value: "UTC", label: "UTC +0:00 GMT", offset: "+0:00" },
  { value: "GMT", label: "London +0:00 GMT", offset: "+0:00" },

  // Europe
  { value: "Europe/Paris", label: "Paris +1:00 GMT", offset: "+1:00" },
  { value: "Europe/Berlin", label: "Berlin +1:00 GMT", offset: "+1:00" },
  { value: "Europe/Rome", label: "Rome +1:00 GMT", offset: "+1:00" },
  { value: "Europe/Madrid", label: "Madrid +1:00 GMT", offset: "+1:00" },
  { value: "Europe/Amsterdam", label: "Amsterdam +1:00 GMT", offset: "+1:00" },
  { value: "Europe/Vienna", label: "Vienna +1:00 GMT", offset: "+1:00" },
  { value: "Europe/Prague", label: "Prague +1:00 GMT", offset: "+1:00" },
  { value: "Europe/Warsaw", label: "Warsaw +1:00 GMT", offset: "+1:00" },
  { value: "Europe/Athens", label: "Athens +2:00 GMT", offset: "+2:00" },
  { value: "Europe/Helsinki", label: "Helsinki +2:00 GMT", offset: "+2:00" },
  { value: "Europe/Istanbul", label: "Istanbul +3:00 GMT", offset: "+3:00" },
  { value: "Europe/Moscow", label: "Moscow +3:00 GMT", offset: "+3:00" },

  // Africa
  { value: "Africa/Cairo", label: "Cairo +2:00 GMT", offset: "+2:00" },
  {
    value: "Africa/Johannesburg",
    label: "Johannesburg +2:00 GMT",
    offset: "+2:00",
  },
  { value: "Africa/Lagos", label: "Lagos +1:00 GMT", offset: "+1:00" },
  { value: "Africa/Nairobi", label: "Nairobi +3:00 GMT", offset: "+3:00" },
  {
    value: "Africa/Casablanca",
    label: "Casablanca +1:00 GMT",
    offset: "+1:00",
  },
  { value: "Africa/Tunis", label: "Tunis +1:00 GMT", offset: "+1:00" },
  { value: "Africa/Algiers", label: "Algiers +1:00 GMT", offset: "+1:00" },

  // Asia
  { value: "Asia/Dubai", label: "Dubai +4:00 GMT", offset: "+4:00" },
  { value: "Asia/Riyadh", label: "Riyadh +3:00 GMT", offset: "+3:00" },
  { value: "Asia/Kuwait", label: "Kuwait +3:00 GMT", offset: "+3:00" },
  { value: "Asia/Doha", label: "Doha +3:00 GMT", offset: "+3:00" },
  { value: "Asia/Muscat", label: "Muscat +4:00 GMT", offset: "+4:00" },
  { value: "Asia/Bahrain", label: "Bahrain +3:00 GMT", offset: "+3:00" },
  { value: "Asia/Tehran", label: "Tehran +3:30 GMT", offset: "+3:30" },
  { value: "Asia/Karachi", label: "Karachi +5:00 GMT", offset: "+5:00" },
  { value: "Asia/Kolkata", label: "Mumbai +5:30 GMT", offset: "+5:30" },
  { value: "Asia/Dhaka", label: "Dhaka +6:00 GMT", offset: "+6:00" },
  { value: "Asia/Bangkok", label: "Bangkok +7:00 GMT", offset: "+7:00" },
  { value: "Asia/Singapore", label: "Singapore +8:00 GMT", offset: "+8:00" },
  {
    value: "Asia/Kuala_Lumpur",
    label: "Kuala Lumpur +8:00 GMT",
    offset: "+8:00",
  },
  { value: "Asia/Jakarta", label: "Jakarta +7:00 GMT", offset: "+7:00" },
  { value: "Asia/Manila", label: "Manila +8:00 GMT", offset: "+8:00" },
  { value: "Asia/Hong_Kong", label: "Hong Kong +8:00 GMT", offset: "+8:00" },
  { value: "Asia/Shanghai", label: "Shanghai +8:00 GMT", offset: "+8:00" },
  { value: "Asia/Beijing", label: "Beijing +8:00 GMT", offset: "+8:00" },
  { value: "Asia/Tokyo", label: "Tokyo +9:00 GMT", offset: "+9:00" },
  { value: "Asia/Seoul", label: "Seoul +9:00 GMT", offset: "+9:00" },

  // Americas
  { value: "America/New_York", label: "New York -5:00 GMT", offset: "-5:00" },
  { value: "America/Chicago", label: "Chicago -6:00 GMT", offset: "-6:00" },
  { value: "America/Denver", label: "Denver -7:00 GMT", offset: "-7:00" },
  {
    value: "America/Los_Angeles",
    label: "Los Angeles -8:00 GMT",
    offset: "-8:00",
  },
  { value: "America/Toronto", label: "Toronto -5:00 GMT", offset: "-5:00" },
  { value: "America/Vancouver", label: "Vancouver -8:00 GMT", offset: "-8:00" },
  {
    value: "America/Mexico_City",
    label: "Mexico City -6:00 GMT",
    offset: "-6:00",
  },
  { value: "America/Sao_Paulo", label: "São Paulo -3:00 GMT", offset: "-3:00" },
  {
    value: "America/Buenos_Aires",
    label: "Buenos Aires -3:00 GMT",
    offset: "-3:00",
  },
  { value: "America/Lima", label: "Lima -5:00 GMT", offset: "-5:00" },
  { value: "America/Bogota", label: "Bogotá -5:00 GMT", offset: "-5:00" },
  { value: "America/Santiago", label: "Santiago -3:00 GMT", offset: "-3:00" },

  // Oceania
  { value: "Australia/Sydney", label: "Sydney +10:00 GMT", offset: "+10:00" },
  {
    value: "Australia/Melbourne",
    label: "Melbourne +10:00 GMT",
    offset: "+10:00",
  },
  { value: "Australia/Perth", label: "Perth +8:00 GMT", offset: "+8:00" },
  { value: "Pacific/Auckland", label: "Auckland +12:00 GMT", offset: "+12:00" },

  // Other Important
  {
    value: "Atlantic/Reykjavik",
    label: "Reykjavik +0:00 GMT",
    offset: "+0:00",
  },
  { value: "Pacific/Honolulu", label: "Honolulu -10:00 GMT", offset: "-10:00" },
];
