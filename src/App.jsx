import { Routes, Route } from "react-router-dom";
import { Login } from "./components/pages/Login.jsx"
import { StudentHomePage } from "./components/pages/StudentHomePage.jsx"
import { AdminDashboard } from "./components/pages/AdminDashboard.jsx"
import { EditProfile } from "./components/pages/EditProfile.jsx"
import { GymCoachesList } from "./components/pages/GymCoachesList.jsx"
import { CoachHomePage } from "./components/pages/CoachHomePage.jsx"
import { SignUp } from "./components/pages/SignUp.jsx";
import { CoachStudentsList } from "./components/pages/CoachStudentsList.jsx";
import { AddTrain } from "./components/pages/AddTrain.jsx";
import { RatingCoach } from "./components/pages/RatingCoach.jsx";
import { AddGym } from "./components/pages/AddGym.jsx";
import { GymAdmin } from "./components/pages/GymAdmin.jsx"
import { ModifyDeleteGyms } from "./components/pages/ModifyDeleteGyms.jsx"
import { ModifyDeleteGym } from "./components/pages/ModifyDeleteGym.jsx"
import { SearchCoachesAdmin } from "./components/pages/SearchCoachesAdmin.jsx"
import { SearchUsersAdmin } from "./components/pages/SearchUsersAdmin.jsx"
import { DeleteCoachAdmin } from "./components/pages/DeleteCoachAdmin.jsx"
import { DeleteUserAdmin } from "./components/pages/DeleteUserAdmin.jsx"
import { ResetPassword } from "./components/pages/ResetPassword.jsx"
import { PrivateRoutes } from "./context/PrivateRoutes.jsx";
function App() {
  return (

    <div className='container'>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route element={<PrivateRoutes />}>
          <Route path="/utilizator" element={<StudentHomePage />} />
          <Route path="/editareProfil" element={<EditProfile />} />
          <Route path="/elevi" element={<CoachStudentsList />} />
          <Route path="/adaugaAntrenament" element={<AddTrain />} />
          <Route path="/notareAntrenor" element={<RatingCoach />} />
          <Route path="/adaugaSala" element={<AddGym />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/adminSali" element={<GymAdmin />} />
          <Route path="/modificaStergeSali" element={<ModifyDeleteGyms />} />
          <Route path="/modificaStergeSala" element={<ModifyDeleteGym />} />
          <Route path="/cautaAntrenorAdmin" element={< SearchCoachesAdmin />} />

          <Route path="/cautaUtilizatorAdmin" element={< SearchUsersAdmin />} />

          <Route path="/stergeAntrenorAdmin" element={<  DeleteCoachAdmin />} />
          <Route path="/stergeUtilizatorAdmin" element={<  DeleteUserAdmin />} />
          <Route path="/sala" element={<GymCoachesList />} />
          <Route path="/antrenor" element={<CoachHomePage />} />
        </Route>
        <Route path="/inregistrare" element={<SignUp />} />
        <Route path="/resetareParola" element={< ResetPassword />} />
      </Routes>
    </div>
  )
}

export default App
