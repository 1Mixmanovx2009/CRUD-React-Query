import { useRoutes } from 'react-router-dom';
import Management from '../pages/Management/Management';

const Routes = () => {
  return useRoutes([
    { path: '/', element: <Management /> },
  ]);
};

export default Routes;