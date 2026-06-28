const normalizeGroups = (groups) => {
  if (Array.isArray(groups)) {
    return groups.map((group) => String(group || "").trim().toLowerCase()).filter(Boolean);
  }

  return String(groups || "")
    .split(/[,\s]+/)
    .map((group) => group.trim().toLowerCase())
    .filter(Boolean);
};

export const resolveUserRole = (user) => {
  const programCode = String(user?.programCode || "").trim().toLowerCase();
  const groups = normalizeGroups(user?.groups);

  if (programCode === "superadmin") {
    return "superadmin";
  }

  if (programCode === "admin" || groups.includes("admins") || groups.includes("admin")) {
    return "admin";
  }

  if (programCode === "merchant" || programCode === "m" || groups.includes("merchants") || groups.includes("merchant")) {
    return "merchant";
  }

  if (programCode === "u" || programCode === "customer") {
    return "U";
  }

  if (programCode) {
    return programCode;
  }

  return null;
};
