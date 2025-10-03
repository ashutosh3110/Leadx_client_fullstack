import React from 'react';
import { useOutletContext } from 'react-router-dom';
import Overview from './Overview';

const AdminOverview = () => {
    const { stats } = useOutletContext();
    
    return <Overview stats={stats} />;
};

export default AdminOverview;

