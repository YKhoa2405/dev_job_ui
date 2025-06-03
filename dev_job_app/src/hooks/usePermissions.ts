// File: src/hooks/usePermissions.ts
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export const usePermissions = () => {
    const permissions = useSelector((state: RootState) => state.user.role.permissions);

    const hasPermission = (permissionId: string) => {
        return permissions.includes(permissionId);
    };

    return { hasPermission };
};