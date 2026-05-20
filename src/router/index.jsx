import { useRoutes } from "react-router-dom";
import LayoutDefault from "../layout";
import Dashboard from "../pages/Dashboard";
import Rooms from "../pages/Rooms";
import Tenants from "../pages/Tenants";
import Contracts from "../pages/Contracts";
import Invoices from "../pages/Invoices";
import Utilities from "../pages/Utilities";


function RouterObject () {
 const router = useRoutes([
    {
        path: "/",
        element: <LayoutDefault/>,
                children:[
                    { index: true, element: <Dashboard/> },
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