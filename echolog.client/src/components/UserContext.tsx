import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

interface UserContextType {
    username: string;
    role: string;
    isAdmin: boolean;
}

const UserContext = createContext<UserContextType>({
    username: 'User',
    role: 'User',
    isAdmin: false
});

export const useUser = () => useContext(UserContext);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [username, setUsername] = useState('User');
    const [role, setRole] = useState('User');
    const isAdmin = role === 'Admin';

    useEffect(() => {
        const token = localStorage.getItem('jwt_token');
        if (token) {
            try {
                const decoded = jwtDecode<any>(token);
                const name = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"];
                const roleDecoded = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

                setUsername(name || 'User');
                setRole(roleDecoded || 'User');
            } catch {
                setUsername('User');
                setRole('User');
            }
        }
    }, []);

    return (
        <UserContext.Provider value={{ username, role, isAdmin }}>
            {children}
        </UserContext.Provider>
    );
};
