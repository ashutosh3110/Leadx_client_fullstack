import React, { createContext, useContext, useState, useEffect } from 'react';

const ColorContext = createContext();

export const useColorContext = () => {
    const context = useContext(ColorContext);
    if (!context) {
        throw new Error('useColorContext must be used within a ColorProvider');
    }
    return context;
};

export const ColorProvider = ({ children }) => {
    const [adminDashboardColor, setAdminDashboardColor] = useState('#3B82F6'); // Default blue
    const [ambassadorDashboardColor, setAmbassadorDashboardColor] = useState('#3B82F6'); // Same as admin - blue

    // Load colors from localStorage on mount
    useEffect(() => {
        const savedAdminColor = localStorage.getItem('adminDashboardColor');
        const savedAmbassadorColor = localStorage.getItem('ambassadorDashboardColor');
        
        if (savedAdminColor) {
            setAdminDashboardColor(savedAdminColor);
        }
        if (savedAmbassadorColor) {
            setAmbassadorDashboardColor(savedAmbassadorColor);
        } else {
            // Set default blue color (same as admin) if no saved color
            setAmbassadorDashboardColor('#3B82F6');
            localStorage.setItem('ambassadorDashboardColor', '#3B82F6');
        }
    }, []);

    // Save colors to localStorage when they change
    useEffect(() => {
        localStorage.setItem('adminDashboardColor', adminDashboardColor);
    }, [adminDashboardColor]);

    useEffect(() => {
        localStorage.setItem('ambassadorDashboardColor', ambassadorDashboardColor);
    }, [ambassadorDashboardColor]);

    const updateAdminDashboardColor = (color) => {
        setAdminDashboardColor(color);
    };

    const updateAmbassadorDashboardColor = (color) => {
        setAmbassadorDashboardColor(color);
    };

    const value = {
        adminDashboardColor,
        ambassadorDashboardColor,
        updateAdminDashboardColor,
        updateAmbassadorDashboardColor
    };

    return (
        <ColorContext.Provider value={value}>
            {children}
        </ColorContext.Provider>
    );
};
