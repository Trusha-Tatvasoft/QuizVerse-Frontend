import { IncomingBattleRequest } from '../../../../shared/interfaces/incoming-battle-request.interface';
export interface BattleRequestWithProfile extends IncomingBattleRequest {
  displayImage?: string | null;
  initials?: string;
  initialsColor?: string;
}
