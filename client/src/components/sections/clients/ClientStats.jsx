import { History, PeopleAlt } from '@mui/icons-material';

const ClientStats = ({ clients, assignedPoliciesCount }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-blue-600 font-medium">Total Clients</p>
                        <p className="text-2xl font-bold text-blue-900">{clients.length}</p>
                    </div>
                    <PeopleAlt className="text-blue-600" />
                </div>
            </div>

            <div className="bg-green-50 p-6 rounded-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-green-600 font-medium">Active Policies</p>
                        <p className="text-2xl font-bold text-green-900">{assignedPoliciesCount}</p>
                    </div>
                    <History className="text-green-600" />
                </div>
            </div>

           
        </div>
    );
}

export default ClientStats;