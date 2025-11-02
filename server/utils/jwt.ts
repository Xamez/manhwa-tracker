import { jwtVerify, SignJWT } from 'jose';
import { ObjectId } from 'mongodb';
import { AuthUser } from '~~/shared/types/authUser';

const config = useRuntimeConfig();
const secret = new TextEncoder().encode(config.jwtSecret);

export async function createToken(authUser: AuthUser): Promise<string> {
  return await new SignJWT(authUser)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret);
}

export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    const authUser = payload as AuthUser;

    const db = useDatabase();
    const existingUser = await db.collection('users').findOne({ _id: new ObjectId(authUser.id) });

    if (!existingUser) {
      console.error('User no longer exists in database');
      return null;
    }

    return authUser;
  } catch (error) {
    console.error('Invalid token:', error);
    return null;
  }
}
