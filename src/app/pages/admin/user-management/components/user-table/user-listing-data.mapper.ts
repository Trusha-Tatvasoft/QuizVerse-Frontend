import { environment } from '../../../../../../environments/environment.dev';
import { Role } from '../../../../../shared/enums/role';
import { UserRoles, UserStatus } from '../../../../../shared/enums/user-management.enum';
import { TableData } from '../../../../../shared/interfaces/table-component.interface';
import { colors, defaultLastLoginDate } from '../../../../../utils/constants';
import { UserListData } from '../../interfaces/user-list-data.interface';

/**
 * Maps a `UserListData` object from the API to a `TableData` format used by the UI table component.
 * Handles formatting of user role, status, quiz attempts, and user profile.
 */
export function userToUserListingTableData(user: UserListData, currentUserRole: Role): TableData {
  const isCurrentUserAdmin = currentUserRole === Role.Admin;
  const isCurrentUserSuperAdmin = currentUserRole === Role.SuperAdmin;
  const isTargetUserAdmin = user.roleId === UserRoles.Admin;
  const isTargetUserSuperAdmin = user.roleId === UserRoles.SuperAdmin;
  const isAdminOrSuperAdmin = isTargetUserAdmin || isTargetUserSuperAdmin;

  const shouldDisableEditActions =
    isCurrentUserAdmin && (isTargetUserSuperAdmin || isTargetUserAdmin);
  const shouldDisableDeleteAction =
    (isCurrentUserAdmin && (isTargetUserSuperAdmin || isTargetUserAdmin)) ||
    (isCurrentUserSuperAdmin && (isTargetUserAdmin || isTargetUserSuperAdmin));

  return {
    id: user.id,
    fullname: {
      name: user.fullName,
      email: user.email,
      image: user.profilePic ? `${environment.imageBaseUrl}/${user.profilePic}` : '',
    },
    role: {
      tagConfig: {
        id: user.roleId.toString(),
        label: getRoleLabel(user.roleId),
        type: 'static',
        backgroundColor: getRoleColor(user.roleId).bg,
        textColor: getRoleColor(user.roleId).text,
      },
    },
    status: {
      tagConfig: {
        id: user.status.toString(),
        label: getStatusLabel(user.status),
        type: 'static',
        backgroundColor: getStatusColor(user.status).bg,
        textColor: getStatusColor(user.status).text,
      },
    },
    createdDate: user.createdDate,
    lastLogin: user.lastLogin !== defaultLastLoginDate ? user.lastLogin : null,
    quizattempt: isAdminOrSuperAdmin
      ? {
          tagConfig: {
            id: `quizzes-${user.id}`,
            label: 'NA',
            type: 'static',
            backgroundColor: 'white',
            textColor: 'black',
          },
        }
      : {
          tagConfig: {
            id: `quizzes-${user.id}`,
            label: user.attemptedQuizzes.toString(),
            type: 'static',
            backgroundColor: 'white',
            textColor: 'black',
          },
          extraText: 'quizzes',
        },
    actions: [
      {
        icon: 'edit',
        tooltip: shouldDisableEditActions ? 'Action not allowed' : 'Edit User',
        isDisabled: shouldDisableEditActions,
      },
      {
        icon: 'delete',
        tooltip: shouldDisableDeleteAction ? 'Action not allowed' : 'Delete User',
        isDisabled: shouldDisableDeleteAction,
      },
      ...(user.status !== UserStatus.Suspended
        ? [
            {
              icon: 'block',
              tooltip: shouldDisableEditActions ? 'Action not allowed' : 'Suspend User',
              isDisabled: shouldDisableEditActions,
            },
          ]
        : []),
      {
        icon: user.status === UserStatus.Active ? 'remove_circle_outline' : 'check_circle_outline',
        tooltip: shouldDisableEditActions
          ? 'Action not allowed'
          : user.status === UserStatus.Active
            ? 'Deactivate User'
            : 'Activate User',
        isDisabled: shouldDisableEditActions,
      },
    ],
  };
}

/**
 * Maps a numeric role ID to its corresponding label.
 */
function getRoleLabel(roleId: number): string {
  switch (roleId) {
    case UserRoles.SuperAdmin:
      return 'Super Admin';
    case UserRoles.Admin:
      return 'Admin';
    default:
      return 'Player';
  }
}

/**
 * Maps a numeric role ID to corresponding UI tag colors.
 */
function getRoleColor(roleId: number): { bg: string; text: string } {
  switch (roleId) {
    case UserRoles.SuperAdmin:
      return { bg: 'lightBlue', text: 'blue' };
    case UserRoles.Admin:
      return { bg: 'lightPurple', text: 'purple' };
    default:
      return { bg: 'lightOrange', text: 'orange' };
  }
}

/**
 * Maps a numeric status to its corresponding label.
 */
function getStatusLabel(status: number): string {
  switch (status) {
    case 1:
      return 'Active';
    case 2:
      return 'Inactive';
    case 3:
      return 'Suspended';
    default:
      return 'Unknown';
  }
}

/**
 * Maps a numeric status to corresponding UI tag colors.
 */
function getStatusColor(status: number): { bg: string; text: string } {
  switch (status) {
    case 1:
      return colors.green;
    case 2:
      return colors.yellow;
    case 3:
      return colors.brown;
    default:
      return colors.white;
  }
}
