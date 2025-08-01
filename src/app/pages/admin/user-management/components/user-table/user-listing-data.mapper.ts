import { UserStatus } from '../../../../../shared/enums/user-management.enum';
import { TableData } from '../../../../../shared/interfaces/table-component.interface';
import { DEFAULT_LAST_LOGIN_DATE } from '../../../../../utils/constants';
import { UserListData } from '../../interfaces/user-list-data.interface';

/**
 * Maps a `UserListData` object from the API to a `TableData` format used by the UI table component.
 * Handles formatting of user role, status, quiz attempts, and user profile.
 */
export function userToUserListingTableData(user: UserListData): TableData {
  return {
    fullname: {
      name: user.fullName,
      email: user.email,
      image: user.profilePic || '', // Fallback to empty string if profilePic is not available
    },
    role: {
      tagConfig: {
        id: user.roleId.toString(),
        label: user.roleId === 1 ? 'Admin' : 'Player',
        type: 'static',
        backgroundColor: user.roleId === 1 ? 'lightPurple' : 'lightOrange',
        textColor: user.roleId === 1 ? 'purple' : 'orange',
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
    lastLogin: user.lastLogin !== DEFAULT_LAST_LOGIN_DATE ? user.lastLogin : null, // Fallback to createdDate if lastLogin is uninitialized
    quizattempt: {
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
      'edit',
      'delete',
      ...(user.status !== UserStatus.Suspended ? ['block'] : []), // Add "block" only if not suspended
      user.status === UserStatus.Active ? 'remove_circle_outline' : 'check_circle_outline', // Toggle action based on status
    ],
  };
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
      return { bg: 'lightGreen', text: 'green' };
    case 2:
      return { bg: 'lightYellow', text: 'yellow' };
    case 3:
      return { bg: 'lightBrown', text: 'brown' };
    default:
      return { bg: 'lightGray', text: 'gray' };
  }
}
