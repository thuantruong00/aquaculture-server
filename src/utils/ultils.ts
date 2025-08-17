export function toSearchKey(input: string): string {
  if (!input) return "";
  return input
    .toLowerCase()
    .normalize("NFD") // tách dấu
    .replace(/[\u0300-\u036f]/g, "") // bỏ dấu tổ hợp
    .replace(/đ/g, "d") // đ -> d
    .replace(/[^a-z0-9\s]/g, " ") // bỏ ký tự đặc biệt
    .replace(/\s+/g, " ") // gọn khoảng trắng
    .trim();
}
