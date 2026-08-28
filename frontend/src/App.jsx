import ActiveProjects from "./components/ActiveProjects"
import ForgotPassword from "./Auth/ForgotPassword"
import AddProject from "./components/AddProject"
import AddInvoice from "./components/AddInvoice"
import Dashboard from "./components/Dashboard"
import AddClient from "./components/AddClient"
import LandingPage from "./pages/LandingPage"
import Clients from "./components/Clients"
import MainPage from "./components/MainPage"
import Invoices from "./components/Invoices"
import { Route, Routes } from "react-router"
import SignUp from "./Auth/SignUp"
import Login from "./Auth/Login"

function App() {

  return (
    <>
      <Routes>

        <Route path="/" element={<LandingPage/>}/>

        <Route path="/login" element={<Login/>}/>
        <Route path="/signup" element={<SignUp/>}/>
        <Route path="/forgotpassword" element={<ForgotPassword/>}/>

        <Route path="/dashboard" element={<MainPage/>}>
          <Route index path="/dashboard/main/:id" element={<Dashboard/>}/>
          <Route index path="/dashboard/clients/:id" element={<Clients/>}/>
          <Route index path="/dashboard/clients/add-client/:id" element={<AddClient/>}/>
          <Route index path="/dashboard/active-projects/:id" element={<ActiveProjects/>}/>
          <Route index path="/dashboard/active-projects/add-project/:id" element={<AddProject/>}/>
          <Route index path="/dashboard/invoices/:id" element={<Invoices/>}/>
          <Route index path="/dashboard/invoices/add-invoice/:id" element={<AddInvoice/>}/>
        </Route>

      </Routes>
    </>
  )
}

export default App