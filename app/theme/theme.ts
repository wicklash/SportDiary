import { brandGradient, darkColors } from "./colors";
import { radius } from "./radius";
import { shadows } from "./shadows";
import { spacing } from "./spacing";
import { typography } from "./typography";

export const theme = {
  colors: darkColors,
  spacing,
  typography,
  radius,
  shadows,
  brandGradient,
} as const;

export type Theme = typeof theme;



