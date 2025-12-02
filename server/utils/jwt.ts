import { jwtVerify, SignJWT } from 'jose';
import { AuthUser } from '~~/shared/types/authUser';
import { ObjectId } from 'mongodb';

const config = useRuntimeConfig();
const secret = new TextEncoder().encode(config.jwtSecret);

export async function createAccessToken(authUser: AuthUser): Promise<string> {
  return await new SignJWT(authUser)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('15m')
    .sign(secret);
}

export async function createRefreshToken(authUser: AuthUser): Promise<string> {
  return await new SignJWT(authUser)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret);
}

async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    const authUser = payload as AuthUser;

    const db = useDatabase();
    const existingUser = await db.collection('users').findOne({ _id: new ObjectId(authUser.id) });

    if (!existingUser) {
      return null;
    }

    return authUser;
  } catch {
    return null;
  }
}

export async function verifyAccessToken(token: string): Promise<AuthUser | null> {
  return verifyToken(token);
}

export async function verifyRefreshToken(token: string): Promise<AuthUser | null> {
  return verifyToken(token);
}
