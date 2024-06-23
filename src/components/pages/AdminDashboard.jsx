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

    const handleLogout = () => {
        const confirmDelete = window.confirm(
            "Ești sigur că vrei să părăsești pagina?"
        );
        if (confirmDelete) {
            localStorage.clear();
            navigate("/");
            window.history.pushState(null, document.title, window.location.href);
            window.addEventListener('popstate', function (event) {
                window.history.pushState(null, document.title, window.location.href);
            });
        }
    }

    return (
        <div className="adminDashboard">
            <button className="signOff" onClick={handleLogout}>Delogare</button>
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

                        <button onClick={deleteChangeGyms}>MODIFICĂ / STERGE SALA🏢</button>
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