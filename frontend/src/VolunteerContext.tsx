import { createContext, useContext, useState, type ReactNode } from 'react';

interface VolunteerContextType {
    isVolunteerMode: boolean;
    setIsVolunteerMode: (mode: boolean) => void;
}

const VolunteerContext = createContext<VolunteerContextType | undefined>(undefined);

export function VolunteerProvider({ children }: { children: ReactNode }) {
    const [isVolunteerMode, setIsVolunteerMode] = useState(false);

    return (
        <VolunteerContext.Provider value={{ isVolunteerMode, setIsVolunteerMode }}>
            {children}
        </VolunteerContext.Provider>
    );
}

export function useVolunteer() {
    const context = useContext(VolunteerContext);
    if (!context) {
        throw new Error('useVolunteer must be used within VolunteerProvider');
    }
    return context;
}
