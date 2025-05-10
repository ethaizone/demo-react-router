import { db } from "~/db/index.server";
import { users, type User, type NewUser } from "~/db/schema";
import { eq } from "drizzle-orm";

export async function getUsers() {
  try {
    return await db.select().from(users).orderBy(users.name);
  } catch (error: any) {
    console.error("Failed to fetch users:", error);
    throw error;
  }
}

export async function getUserById(id: number) {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  } catch (error: any) {
    console.error(`Failed to fetch user ${id}:`, error);
    throw error;
  }
}

export async function createUser(user: NewUser) {
  try {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  } catch (error: any) {
    console.error("Failed to create user:", error);
    throw error;
  }
}

export async function updateUser(id: number, user: Partial<NewUser>) {
  try {
    const [updatedUser] = await db
      .update(users)
      .set(user)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  } catch (error: any) {
    console.error(`Failed to update user ${id}:`, error);
    throw error;
  }
}

export async function deleteUser(id: number) {
  try {
    await db.delete(users).where(eq(users.id, id));
  } catch (error: any) {
    console.error(`Failed to delete user ${id}:`, error);
    throw error;
  }
}
