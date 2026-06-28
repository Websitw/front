import { Outlet } from 'react-router-dom';
import './UserLayout.css';
import UserSidebar from '../components/UserSidebar/UserSidebar';

const UserLayout = () => {

  return (
    <>
     <UserSidebar />
      <div className="user-layout-content">
        <Outlet />
      </div>
    </>
  );
};

export default UserLayout;