import React from "react"
// import { createMuiTheme } from "@material-ui/core/styles"
// import { ThemeProvider } from "@material-ui/styles"

// import { red } from "@material-ui/core/colors"

// import { SnackbarProvider } from "notistack"
// import SideNav from "components/SideNav"
// import { ConfirmProvider } from "material-ui-confirm"
import Routes from "Routes"
import "./index.css"
import ProviderWrapper from "components/ProviderWrapper"

export default function App() {
  // const theme = createMuiTheme({
  //   palette: {
  //     primary: red,
  //     secondary: {
  //       main: "#f44336",
  //     },

  //     type: "dark", // Switching the dark mode on is a single property value change.
  //   },
  // })

  // add action to all snackbars
  // const notistackRef = React.createRef()
  // const onClickDismiss = key => () => {
  //     notistackRef.current.closeSnackbar(key);
  // }

  // function dismiss(key){
  //   return(
  //     <IconButton style={{color: 'black'}} onClick={onClickDismiss(key)} size="small">
  //           <Close/>
  //     </IconButton>
  //   )
  // }

  return (
    <div>
      <ProviderWrapper>
        <Routes />
      </ProviderWrapper>
    </div>
  )
}
