import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: number;
      username: string;
      email: string;
      first_name: string;
      last_name: string;
    };
  }

  interface User {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  }
}

