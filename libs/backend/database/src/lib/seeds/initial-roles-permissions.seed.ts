import { DataSource } from 'typeorm';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { RolePermission } from '../entities/role-permission.entity';

export async function seedRolesAndPermissions(dataSource: DataSource) {
    const roleRepo = dataSource.getRepository(Role);
    const permissionRepo = dataSource.getRepository(Permission);
    const rolePermissionRepo = dataSource.getRepository(RolePermission);

    // Create permissions
    const resources = ['organizations', 'clinics', 'users', 'patients', 'appointments', 'roles', 'permissions'];
    const actions = ['create', 'read', 'update', 'delete'];

    const permissions: Permission[] = [];
    for (const resource of resources) {
        for (const action of actions) {
            const permission = permissionRepo.create({
                resource,
                action,
                name: `${resource}:${action}`,
                description: `Can ${action} ${resource}`,
            });
            permissions.push(await permissionRepo.save(permission));
        }
    }

    // Create roles
    const roles = [
        {
            name: 'super_admin',
            display_name: 'Super Administrator',
            description: 'Full system access',
            is_system_role: true,
            permissions: permissions, // All permissions
        },
        {
            name: 'org_owner',
            display_name: 'Organization Owner',
            description: 'Organization level administrator',
            is_system_role: true,
            permissions: permissions.filter(p =>
                !p.name.includes('organizations:delete') &&
                !p.name.includes('permissions:') &&
                !p.name.includes('roles:')
            ),
        },
        {
            name: 'clinic_owner',
            display_name: 'Clinic Owner',
            description: 'Clinic level administrator',
            is_system_role: true,
            permissions: permissions.filter(p =>
                p.name.includes('clinics:') ||
                p.name.includes('users:') ||
                p.name.includes('patients:') ||
                p.name.includes('appointments:')
            ),
        },
        {
            name: 'practitioner',
            display_name: 'Practitioner',
            description: 'Medical practitioner',
            is_system_role: true,
            permissions: permissions.filter(p =>
                p.name.includes('patients:read') ||
                p.name.includes('appointments:')
            ),
        },
        {
            name: 'receptionist',
            display_name: 'Receptionist',
            description: 'Front desk staff',
            is_system_role: true,
            permissions: permissions.filter(p =>
                p.name.includes('patients:') ||
                p.name.includes('appointments:')
            ),
        },
    ];

    for (const roleData of roles) {
        const role = roleRepo.create({
            name: roleData.name,
            display_name: roleData.display_name,
            description: roleData.description,
            is_system_role: roleData.is_system_role,
        });
        const savedRole = await roleRepo.save(role);

        // Assign permissions to role
        for (const permission of roleData.permissions) {
            const rolePermission = rolePermissionRepo.create({
                role_id: savedRole.id,
                permission_id: permission.id,
            });
            await rolePermissionRepo.save(rolePermission);
        }
    }

    console.log('Roles and permissions seeded successfully');
}