import { MantineProvider, createTheme } from "@mantine/core";
import { useAppTheme } from "../../theme/ThemeContext.jsx";
import { ThemeProvider } from "../../theme/ThemeProvider.jsx";
import { AppQueryProvider } from "./QueryProvider.jsx";

const mantineTheme = createTheme({
  fontFamily: "var(--font-sans)",
  primaryColor: "teal",
  defaultRadius: "md",
});

function MantineBridge({ children }) {
  const { theme } = useAppTheme();
  return (
    <MantineProvider theme={mantineTheme} forceColorScheme={theme}>
      {children}
    </MantineProvider>
  );
}

export function AppProviders({ children }) {
  return (
    <AppQueryProvider>
      <ThemeProvider>
        <MantineBridge>{children}</MantineBridge>
      </ThemeProvider>
    </AppQueryProvider>
  );
}
