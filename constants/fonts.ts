/**
 * Font family constants for consistent usage throughout the app
 * All fonts are loaded from @/assets/fonts/
 */

export const Fonts = {
  // Regular weight
  Regular: "Poppins-Regular",
  Italic: "Poppins-Italic",

  // Light weights
  Thin: "Poppins-Thin",
  ThinItalic: "Poppins-ThinItalic",
  ExtraLight: "Poppins-ExtraLight",
  ExtraLightItalic: "Poppins-ExtraLightItalic",
  Light: "Poppins-Light",
  LightItalic: "Poppins-LightItalic",

  // Medium weight
  Medium: "Poppins-Medium",
  MediumItalic: "Poppins-MediumItalic",

  // Bold weights
  SemiBold: "Poppins-SemiBold",
  SemiBoldItalic: "Poppins-SemiBoldItalic",
  Bold: "Poppins-Bold",
  BoldItalic: "Poppins-BoldItalic",
  ExtraBold: "Poppins-ExtraBold",
  ExtraBoldItalic: "Poppins-ExtraBoldItalic",
  Black: "Poppins-Black",
  BlackItalic: "Poppins-BlackItalic",
} as const;

/**
 * Font weight values mapped to font family names
 * Useful for dynamic font weight selection
 */
export const FontWeights = {
  100: Fonts.Thin,
  200: Fonts.ExtraLight,
  300: Fonts.Light,
  400: Fonts.Regular,
  500: Fonts.Medium,
  600: Fonts.SemiBold,
  700: Fonts.Bold,
  800: Fonts.ExtraBold,
  900: Fonts.Black,
} as const;
