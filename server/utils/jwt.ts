import { jwtVerify, SignJWT } from 'jose';
import { ObjectId } from 'mongodb';

const config = useRuntimeConfig();
const secret = new TextEncoder().encode(config.jwtSecret);

export async function createToken(user: User): Promise<string> {
  return await new SignJWT(user)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret);
}

export async function verifyToken(token: string): Promise<User | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    const user = payload as User;

    const db = useDatabase();
    const existingUser = await db.collection('users').findOne({ _id: new ObjectId(user.id) });

    if (!existingUser) {
      console.error('User no longer exists in database');
      return null;
    }

    return user;
  } catch (error) {
    console.error('Invalid token:', error);
    return null;
  }
}
