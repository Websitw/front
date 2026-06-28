import {
  CheckCircle2,
  PauseCircle,
  TimerOff,
  Percent,
  CircleDollarSign,
} from "lucide-react";

export const getStatusFilters = (t) => [
  { value: "active", icon: CheckCircle2, label: t("promocode.filters.Active") },
  {
    value: "inactive",
    icon: PauseCircle,
    label: t("promocode.filters.Inactive"),
  },
  { value: "expired", icon: TimerOff, label: t("promocode.filters.Expired") },
];

export const getTypeFilters = (t) => [
  {
    value: "percentage",
    icon: Percent,
    label: t("promocode.filters.Percentage"),
  },
  {
    value: "fixed",
    icon: CircleDollarSign,
    label: t("promocode.filters.Fixed Amount"),
  },
];

