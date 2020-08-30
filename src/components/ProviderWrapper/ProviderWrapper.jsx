import React from "react"
import { createMuiTheme, ThemeProvider } from "@material-ui/core"
import { SnackbarProvider } from "notistack"
import { ConfirmProvider } from "material-ui-confirm"
import { red } from "@material-ui/core/colors"
import { AuthTokenProvider } from "Contexts/AuthTokenContext"

export default function ProviderWrapper({ children }) {
  // App Theme
  const theme = createMuiTheme({
    palette: {
      primary: red,
      secondary: {
        main: "#f44336",
      },

      type: "dark", // Switching the dark mode on is a single property value change.
    },
  })

  // notistack
  const notistackRef = React.createRef()
  return (
    <div>
      <ThemeProvider theme={theme}>
        <SnackbarProvider
          ref={notistackRef}
          maxSnack={3}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
        >
          <ConfirmProvider>
            <AuthTokenProvider>{children}</AuthTokenProvider>
          </ConfirmProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </div>
  )
}
