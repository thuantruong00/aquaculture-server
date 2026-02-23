export const formatDate = (
  dateString?: string | Date | null
): string => {
  if (!dateString) return "--/--";

  const dateObj = new Date(dateString);

  if (isNaN(dateObj.getTime())) return "--/--";

  const hours = String(dateObj.getHours()).padStart(2, "0");
  const minutes = String(dateObj.getMinutes()).padStart(2, "0");
  const seconds = String(dateObj.getSeconds()).padStart(2, "0");

  const day = String(dateObj.getDate()).padStart(2, "0");
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const year = dateObj.getFullYear();

  return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
};