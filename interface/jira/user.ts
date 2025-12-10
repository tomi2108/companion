export type JiraUserResponse = {
  displayName: string;
  emailAddress: string;
  accountId: string;
};

export class JiraUser {
  id: string;
  name?: string;
  email?: string;

  static fromUserResponse({ accountId, displayName, emailAddress }: JiraUserResponse) {
    const user = new JiraUser(accountId);
    user.name = displayName;
    user.email = emailAddress;
    return user;
  }

  toChoice() {
    return { name: this.name ?? "", hint: this.email ?? "" };
  }

  constructor(id: string) {
    this.id = id;
  }
}
