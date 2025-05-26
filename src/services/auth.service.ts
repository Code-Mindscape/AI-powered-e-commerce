import { ManagementClient } from 'auth0';

export class Auth0Service {
  private static management: ManagementClient;

  static getMgmtClient(): ManagementClient {
    if (!this.management) {
      const domain = process.env.AUTH_DOMAIN;
      const clientId = process.env.AUTH_CLIENTID;
      const clientSecret = process.env.AUTH_CLIENT_SECRET;

      if (!domain || !clientId || !clientSecret) {
        throw new Error('Missing Auth0 configuration in environment variables.');
      }

      this.management = new ManagementClient({
        domain,
        clientId,
        clientSecret,
        audience: `https://${domain}/api/v2/`,
        // `tokenProvider` is NOT supported here — removed.
      });
    }

    return this.management;
  }

static async createUser(email: string, password: string, username: string): Promise<{ user_id: string }> {
  const auth0 = this.getMgmtClient();

  const response = await auth0.users.create({
    email,
    username,
    password,
    connection: 'Username-Password-Authentication',
    email_verified: false,
  });

  const user = response.data as { user_id: string };

  if (!user?.user_id) {
    throw new Error('User creation failed — no user_id returned.');
  }

  return user;
}
}
