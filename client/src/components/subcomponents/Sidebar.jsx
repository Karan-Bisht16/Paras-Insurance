import { BusinessRounded, ChevronLeft, ChevronRight, ConnectWithoutContact, Dashboard, PeopleAlt, Person, Policy } from '@mui/icons-material';

const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Dashboard },
    { id: 'policies', label: 'Policy Management', icon: Policy },
    { id: 'clients', label: 'Client Management', icon: PeopleAlt },
    { id: 'companies', label: 'Company Management', icon: BusinessRounded },
    { id: 'employee', label: 'Employee Management', icon: Person },
    { id: 'callback', label: 'Request Callback', icon: ConnectWithoutContact },
];

const Sidebar = ({ isCollapsed, toggleSidebar, activeSection, setActiveSection }) => {
    return (
        <div className={`${isCollapsed ? 'w-14' : 'w-64'} fixed left-0 top-0 z-[1000] h-screen bg-gray-900 text-white transition-none`}>
            <div className={`flex items-center ${isCollapsed ? 'pl-0 justify-center' : 'pl-4 justify-between'}  pt-3 pb-2.5`}>
                {!isCollapsed && <span className="ml-4 text-xl font-semibold">Paaras Financials</span>}
                <button
                    onClick={toggleSidebar}
                    className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                    {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
                </button>
            </div>

            <nav>
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.id} type='button'
                            onClick={() => setActiveSection(item.id)}
                            className={`w-full flex items-center p-4 hover:bg-gray-800 transition-colors ${activeSection === item.id ? 'bg-blue-600' : ''}`}
                        >
                            <Icon />
                            {!isCollapsed && <span className="ml-4">{item.label}</span>}
                        </button>
                    );
                })}
            </nav>
        </div>
    );
}

export default Sidebar;