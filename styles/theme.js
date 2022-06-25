import { theme as chakraTheme } from '@chakra-ui/react'
import { extendTheme } from '@chakra-ui/react'
import { createBreakpoints } from '@chakra-ui/theme-tools'

// Fluid Typography.
// font-size  = calc(ZZ + ((1vw - XX) * YY))
// Where   XX = min_viewport / 100
//         YY = 100 * (max_font_size - min_font_size) / (max_viewport - min_viewport)
//            = 100 * font_size_difference / viewport_difference
//         ZZ = Minimum font-size stated in REM

const config = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
}

const fluidType = (minFont, maxFont) => {
  let XX = 768 / 100
  let YY = (100 * (maxFont - minFont)) / (1920 - 768)
  let ZZ = minFont / 16
  return `calc(${ZZ}rem + ((1vw - ${XX}px) * ${YY}))`
}

const colors = {
  background: '#FFFFFF',
  secondary: '#ECEFF4',
  complement: '#5F85DB',
  displayColor: '#2E3440',
  textPrimary: '#2e3440',
  textSecondary: '#353941',
  darkText: '4c566a',
  button1: '#2E3440',
  button2: '#81A1C1',
  button3: '#A3BE8C',
  button4: '#88C0D0',
  button5: '#8FBCBB',
  borderColor: '#2E3440',
  buttonHover: '#E5E9F0',
}

const fonts = {
  ...chakraTheme.fonts,
  body: `Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"`,
  heading: `Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"`,
  logo: `"Neuzeit Grotesk Bold"`
}

const breakpoints = createBreakpoints({
  base: '0em',
  sm: '30em',
  md: '48em',
  lg: '80em',
  xl: '80em',
})

const Link = {
  baseStyle: {
    color: '#5F85DB',
    _hover: { color: '#5F85DB', textDecoration: 'none' },
  },
}

const overrides = {
  ...chakraTheme,
  components: {
    Link,
  },
  config,
  colors,
  fonts,
  breakpoints,
  fontWeights: {
    normal: 300,
    medium: 600,
    bold: 700,
  },
  fontSizes: {
    //   xs: fluidType(6, 12),
    //   sm: fluidType(7, 14),
    //   md: fluidType(8, 16),
    //   lg: fluidType(9, 18),
    //   xl: fluidType(10, 20),
    //   '2xl': fluidType(12, 24),
    //   '3xl': fluidType(14, 28),
    //   '4xl': fluidType(18, 36),
    //   '5xl': fluidType(20, 40),
    //   '6xl': fluidType(24, 48),
    //   '7xl': fluidType(32, 64),
    //   '8xl': fluidType(36, 72),
    display: fluidType(80, 144),
    display2: fluidType(24, 36),
    display3: fluidType(16, 24),
  },
}

const customTheme = extendTheme(overrides)

export default customTheme
