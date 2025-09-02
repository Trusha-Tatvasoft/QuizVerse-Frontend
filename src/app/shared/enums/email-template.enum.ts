export enum EmailTemplateType {
  AccountSuspension = 1,
  BattleRequest = 2,
  EmailVerification = 3,
  QuizInvitation = 4,
  ResetPassword = 5,
  WelcomeEmail = 6,
  NewUser = 7,
}

export enum EmailTemplateStatus {
  Active = 1,
  Inactive = 2,
}

export enum EmailTemplateAction {
  Delete = 1,
  UpdateStatus = 2,
}
