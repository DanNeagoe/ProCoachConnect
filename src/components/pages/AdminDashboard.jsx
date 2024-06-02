import "./AdminDashboard.scss"
import { useNavigate } from "react-router-dom";
export const AdminDashboard = () => {
    const navigate = useNavigate();
    const handleAddGym = () => {
        navigate("/adminSali")
    }

    const deleteChangeGyms = () => {
        navigate("/modificaStergeSali")
    }

    const deleteCoaches = () => {
        navigate("/cautaAntrenorAdmin")
    }

    const deleteUsers = () => {
        navigate("/cautaUtilizatorAdmin")
    }

    return (
        <div className="adminDashboard">
            <div className="adminDashboardMainContainer">
                <div className="adminDashboardContainer">
                    <div className="adminDashboardFirstContainer">
                        <button onClick={deleteCoaches}>ȘTERGE ANTRENORI🏋️‍♂️</button>
                    </div>
                    <div className="adminDashboardSecondContainer">
                        <button onClick={deleteUsers}>ȘTERGE UTILIZATORI🏃‍♂️</button>
                    </div>
                </div>
                <div className="adminDashboardContainer">
                    <div className="adminDashboardFirstContainer">

                        <button onClick={deleteChangeGyms}>MODIFICĂ/STERGE SALA🏢</button>
                    </div>
                    <div className="adminDashboardSecondContainer">

                        <button onClick={handleAddGym}>ADAUGA SALA🏢</button>

                    </div>

                </div>

            </div>
        </div>
    );
}

export default AdminDashboard;