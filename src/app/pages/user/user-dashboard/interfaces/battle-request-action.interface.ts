import { BattleRequestStatus } from '../../../../shared/enums/user-dashboard.enum';

export interface BattleRequestAction {
  requestId: number;
  status: BattleRequestStatus;
}
