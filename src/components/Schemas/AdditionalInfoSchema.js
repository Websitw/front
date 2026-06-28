import { z } from "zod";

export const AdditionalInfoSchema = z
  .object({
    gender: z.string().min(1, "the gender is required"),
    startDay: z.string().min(1, "the birth day is required"),
    startMonth: z.string().min(1, "the birth month is required"),
    startYear: z.string().min(1, "the birth year is required"),
  })
  .superRefine((data, ctx) => {
    const { startDay, startMonth, startYear } = data;
    if (!startDay || !startMonth || !startYear) return;

    const birthDate = new Date(
      parseInt(startYear),
      parseInt(startMonth) - 1,
      parseInt(startDay)
    );
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    if (age < 18) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "you must be at least 18 years old",
        path: ["startYear"],
      });
    }
  });