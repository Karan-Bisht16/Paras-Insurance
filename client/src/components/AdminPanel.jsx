import { useState } from 'react';
// importing components
import Sidebar from './subcomponents/Sidebar';
import Dashboard from './sections/Dashboard';
import ClientManagement from './sections/ClientManagement';
import PolicyManagement from './sections/PolicyManagement';
import CompanyManagement from './sections/CompanyManagement';
import EmployeeManagement from './sections/EmployeeManagement';
import RequestCallback from './sections/RequestCallback';

const AdminPanel = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [activeSection, setActiveSection] = useState('dashboard');

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    const renderSection = () => {
        switch (activeSection) {
            case 'dashbord':
                return <Dashboard />;
            case 'clients':
                return <ClientManagement />;
            case 'policies':
                return <PolicyManagement />;
            case 'companies':
                return <CompanyManagement />;
            case 'employee':
                return <EmployeeManagement />;
            case 'callback':
                return <RequestCallback />;
            default:
                return <Dashboard />;
        }
    };

    return (
        <div className='flex h-[100%] bg-gray-100'>
            <Sidebar
                isCollapsed={isCollapsed} toggleSidebar={toggleSidebar}
                activeSection={activeSection} setActiveSection={setActiveSection}
            />

            <div className={`flex-1 ${isCollapsed ? 'ml-14 max-w-[calc(100vw-5.5rem)]' : 'ml-64 max-w-[calc(100vw-18rem)]'} transition-none`}>
                <main className='p-6'>
                    {renderSection()}
                </main>
            </div>
        </div>
    );
}

export default AdminPanel;