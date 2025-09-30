import { ConfirmationDialogData } from '../../../../shared/interfaces/confirmation-dialog.interface';
import {
  cancelButtonConfig,
  resumeDialogButtonConfig,
} from '../../quiz-attempt-layout/configs/quiz-attempt.config';

export const resumeBattleDialog: ConfirmationDialogData = {
  title: 'Resume Battle',
  message:
    'Do you want to resume your battle. Cancelling this will forfeit the battle and your opponent will be declared the winner.',
  confirmButtonConfig: resumeDialogButtonConfig,
  cancelButtonConfig: cancelButtonConfig,
};
