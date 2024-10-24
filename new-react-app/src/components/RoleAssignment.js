import React, { useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import { initializeContract } from '../services/contractService';
import { toast } from 'react-toastify';

const RoleAssignment = () => {
    const [selectedRole, setSelectedRole] = useState('');
    const [accountAddress, setAccountAddress] = useState('');
    const [rolesForAccount, setRolesForAccount] = useState([]);
    const [addressesWithRole, setAddressesWithRole] = useState([]);
    const [loading, setLoading] = useState(false);
    const contractRef = useRef(null);

    const roleOptions = ["AUDITOR_ROLE", "ADMIN_ROLE", "CONTRACTOR_ROLE"];

    useEffect(() => {
        const initContract = async () => {
            try {
                const contractInstance = await initializeContract();
                contractRef.current = contractInstance;
                if (!contractInstance) {
                    toast.error('Failed to initialize contract. Please connect your wallet.');
                }
            } catch (error) {
                toast.error('Failed to initialize contract. Please connect your wallet.');
                console.error('Contract initialization failed:', error);
            }
        };
        initContract();
    }, []);

    const handleRoleAction = async (action) => {
        if (!selectedRole || !accountAddress) {
            toast.error('Please select a role and enter an account address.');
            return;
        }

        if (!ethers.utils.isAddress(accountAddress)) {
            toast.error('Invalid account address.');
            return;
        }

        if (!contractRef.current) {
            toast.error('Contract is not initialized. Please connect your wallet.');
            return;
        }

        setLoading(true);
        try {
            const roleBytes32 = ethers.utils.formatBytes32String(selectedRole);
            const transaction = action === 'assign' 
                ? await contractRef.current.grantRole(roleBytes32, accountAddress)
                : await contractRef.current.revokeRole(roleBytes32, accountAddress);

            await transaction.wait();
            toast.success(`Role ${selectedRole} ${action === 'assign' ? 'assigned to' : 'revoked from'} ${accountAddress} successfully!`);
            setAccountAddress('');
        } catch (error) {
            console.error(`Error during role ${action}:`, error);
            toast.error(`Failed to ${action} role: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const checkRolesForAccount = async () => {
        if (!ethers.utils.isAddress(accountAddress)) {
            toast.error('Invalid account address.');
            return;
        }

        if (!contractRef.current) {
            toast.error('Contract is not initialized. Please connect your wallet.');
            return;
        }

        setLoading(true);
        try {
            const roles = [];
            for (const role of roleOptions) {
                const roleBytes32 = ethers.utils.formatBytes32String(role);
                const hasRole = await contractRef.current.hasRole(roleBytes32, accountAddress);
                if (hasRole) {
                    roles.push(role);
                }
            }
            setRolesForAccount(roles);
        } catch (error) {
            console.error('Error checking roles for account:', error);
            toast.error('Failed to check roles for account.');
        } finally {
            setLoading(false);
        }
    };

    const checkAddressesWithRole = async () => {
        if (!selectedRole) {
            toast.error('Please select a role to check.');
            return;
        }

        if (!contractRef.current) {
            toast.error('Contract is not initialized. Please connect your wallet.');
            return;
        }

        setLoading(true);
        try {
            const addresses = await contractRef.current.getAddressesWithRole(ethers.utils.formatBytes32String(selectedRole));
            setAddressesWithRole(addresses);
        } catch (error) {
            console.error('Error checking addresses with role:', error);
            toast.error('Failed to check addresses with role.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Role Assignment</h2>
            <div>
                <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} disabled={loading}>
                    <option value="">Select Role</option>
                    {roleOptions.map((role) => (
                        <option key={role} value={role}>{role}</option>
                    ))}
                </select>
                <input
                    type="text"
                    placeholder="Account Address"
                    value={accountAddress}
                    onChange={(e) => setAccountAddress(e.target.value)}
                    disabled={loading}
                />
                <button onClick={() => handleRoleAction('assign')} disabled={loading}>
                    {loading ? 'Assigning Role...' : 'Assign Role'}
                </button>
                <button onClick={() => handleRoleAction('revoke')} disabled={loading}>
                    {loading ? 'Revoking Role...' : 'Revoke Role'}
                </button>
            </div>

            <div>
                <h3>Check Roles for Account</h3>
                <input
                    type="text"
                    placeholder="Account Address"
                    value={accountAddress}
                    onChange={(e) => setAccountAddress(e.target.value)}
                    disabled={loading}
                />
                <button onClick={checkRolesForAccount} disabled={loading}>
                    {loading ? 'Checking...' : 'Check Roles'}
                </button>
                {rolesForAccount.length > 0 && (
                    <div>
                        <h4>Roles for {accountAddress}:</h4>
                        <ul>
                            {rolesForAccount.map((role) => (
                                <li key={role}>{role}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            <div>
                <h3>Check Addresses with Role</h3>
                <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} disabled={loading}>
                    <option value="">Select Role</option>
                    {roleOptions.map((role) => (
                        <option key={role} value={role}>{role}</option>
                    ))}
                </select>
                <button onClick={checkAddressesWithRole} disabled={loading}>
                    {loading ? 'Checking...' : 'Check Addresses'}
                </button>
                {addressesWithRole.length > 0 && (
                    <div>
                        <h4>Addresses with {selectedRole}:</h4>
                        <ul>
                            {addressesWithRole.map((address) => (
                                <li key={address}>{address}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoleAssignment;
