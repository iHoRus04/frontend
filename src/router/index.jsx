import { useRoutes, Navigate } from "react-router-dom";
import LayoutDefault from "../layout";
import Rooms from "../pages/Rooms";
import Tenants from "../pages/Tenants";
import Contracts from "../pages/Contracts";
import Invoices from "../pages/Invoices";
import Utilities from "../pages/Utilities";
import Login from "../pages/Login";
import Home from "../pages/Home";

function RequireAuth({ children }) {
    try {
        const token = localStorage.getItem('authToken');
        if (!token) return <Navigate to="/login" replace />;
    } catch (e) {
        return <Navigate to="/login" replace />;
    }
    return children;
}


function RouterObject () {
 const router = useRoutes([
   { path: '/login', element: <Login/> },
    {
        path: "/",
        element: <RequireAuth><LayoutDefault/></RequireAuth>,
                children:[
                    { index: true, element: <Home/> },
                    { path: 'rooms', element: <Rooms/> },
                    { path: 'tenants', element: <Tenants/> },
                    { path: 'contracts', element: <Contracts/> },
                    { path: 'invoices', element: <Invoices/> },
                    { path: 'utilities', element: <Utilities/> }
                ]
    }
    ]);
    return router;
}
export default RouterObject;