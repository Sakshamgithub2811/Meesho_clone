import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import {useSelector} from 'react-redux';

const ProtectedRoute = ({allowedRoles}) =>{
  const { currentUser, isAuthenticated } = useSelector((state)=> state.user);
  
  if(!isAuthenticated || !currentUser){
    return <Navigate to="/login" replace/>;
  }

  if(allowedRoles && !allowedRoles.includes(currentUser.role)){
    return <Navigate to="/" replace />
  }

  return <Outlet/>
};


export default ProtectedRoute;
