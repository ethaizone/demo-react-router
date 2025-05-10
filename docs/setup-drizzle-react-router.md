# Drizzle + React Router v7 Integration Setup Guide (Framework Mode)

This guide provides step-by-step instructions for integrating Drizzle ORM with a React Router v7 application using its framework mode, which provides conventions similar to Remix v2.

## Prerequisites

- Node.js and npm installed
- React Router v7 project initialized with framework mode enabled (typically via a Vite plugin like `@react-router/dev`)
- PostgreSQL database (or any other supported database)

## Installation

1. Install required dependencies:

```bash
npm install drizzle-orm pg react-router react-router-dom
npm install -D drizzle-kit @types/pg @react-router/dev react-router-typegen
```

_Note: `@react-router/dev` is typically used for the Vite plugin enabling framework mode and file-based routing. `react-router-typegen` is for generating types based on your routes._

## Configuration

1.  Create a `.env` file in your project root:

```env
DATABASE_URL=postgres://<user>:<password>@<host>:<port>/<dbname>
```

2.  Create a database schema file `app/db/schema.ts`:

```typescript
import { pgTable, serial, text, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: text("email").notNull().unique(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
```

3.  Create a database configuration file `app/db/index.server.ts`:

```typescript
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// Ensure this file is only run on the server
declare global {
  var dbPool: Pool | undefined;
}

const pool =
  global.dbPool ||
  new Pool({
    connectionString: process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV === "development") {
  global.dbPool = pool;
}

export const db = drizzle(pool, { schema });
```

_Note: The global check helps prevent creating multiple database connections in development due to Hot Module Replacement._

4.  Create a migration script configuration `drizzle.config.ts`:

```typescript
import type { Config } from "drizzle-kit";

export default {
  schema: "./app/db/schema.ts",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

5.  Add migration and type generation scripts to `package.json`:

```json
{
  "scripts": {
    "generate": "drizzle-kit generate:pg",
    "migrate": "drizzle-kit push:pg",
    "react-router-typegen": "react-router typegen"
  }
}
```

_Run `npm run react-router-typegen -- --watch` during development to automatically generate types for your routes._

6.  Configure file-based routing (if not already set up). This typically involves a file like `app/routes.ts` or similar, depending on your `@react-router/dev` setup, which might look like this if using `@react-router/fs-routes`:

```typescript
import { type RouteConfig } from "@react-router/dev/dist/vite"; // Adjust import based on your setup
import { flatRoutes } from "@react-router/fs-routes";

export default flatRoutes() satisfies RouteConfig;
```

_Consult the `@react-router/dev` or `@react-router/fs-routes` documentation for the exact configuration required for your project._

## Usage Examples

React Router v7 framework mode uses file conventions for routing and co-locates data handling (loaders and actions) within the route module files, similar to Remix.

### Database Operations (Server-only)

These functions remain largely the same as they abstract the database interactions. They should reside in server-only files, e.g., `app/models/user.server.ts`.

```typescript
// app/models/user.server.ts
import { db } from "~/db/index.server"; // Adjust import alias if necessary
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
```

### Route Examples

Route modules in React Router v7 framework mode are typically located in the `app/routes` directory.

```typescript
// app/routes/users._index.tsx
import {
  json,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
} from "react-router"; // Import from react-router
import { useLoaderData, Form } from "react-router-dom"; // Import from react-router-dom
import { getUsers, createUser, deleteUser } from "~/models/user.server"; // Adjust import alias
import type { User } from "~/db/schema"; // Adjust import alias
import type { Route } from "./+types/users._index"; // Import generated types

export async function loader() {
  try {
    const users = await getUsers();
    return json({ users });
  } catch (error: any) {
    // React Router v7 error handling
    console.error("Failed to fetch users:", error);
    throw json({ message: "Failed to load users" }, { status: 500 });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const actionType = formData.get("action"); // Renamed to avoid conflict with function name

  try {
    switch (actionType) {
      case "create": {
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        // Basic validation
        if (!name || !email) {
          throw json(
            { message: "Name and email are required" },
            { status: 400 }
          );
        }
        const user = await createUser({ name, email });
        return json({ user, success: true }); // Return success flag
      }

      case "delete": {
        const id = parseInt(formData.get("id") as string);
        // Basic validation
        if (isNaN(id)) {
          throw json({ message: "Invalid user ID" }, { status: 400 });
        }
        await deleteUser(id);
        return json({ success: true });
      }

      default:
        throw json({ message: "Invalid action" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Failed to perform action:", error);
    // Return error details in the response
    return json(
      { message: error.message || "Failed to perform action" },
      { status: error.status || 500 }
    );
  }
}

export default function Users() {
  const { users } = useLoaderData<typeof loader>(); // Use typeof loader for type safety

  return (
    <div>
      <h1>Users</h1>

      <Form method="post">
        <input type="hidden" name="action" value="create" />
        <input name="name" placeholder="Name" required />
        <input name="email" type="email" placeholder="Email" required />
        <button type="submit">Add User</button>
      </Form>

      {users.length ? (
        <ul>
          {users.map((user) => (
            <li key={user.id}>
              {user.name} ({user.email})
              <Form method="post" style={{ display: "inline" }}>
                <input type="hidden" name="action" value="delete" />
                <input type="hidden" name="id" value={user.id} />
                <button type="submit">Delete</button>
              </Form>
            </li>
          ))}
        </ul>
      ) : (
        <p>No users found.</p>
      )}
    </div>
  );
}
```

_Note: Error handling in loaders and actions in React Router v7 can be done by throwing a `Response` object or an `Error`. The `useLoaderData` hook is typed using `typeof loader` for enhanced type safety with `react-router-typegen`._

```typescript
// app/routes/users.$id.tsx
import {
  json,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
} from "react-router"; // Import from react-router
import { useLoaderData, Form } from "react-router-dom"; // Import from react-router-dom
import { getUserById, updateUser } from "~/models/user.server"; // Adjust import alias
import type { Route } from "./+types/users.$id"; // Import generated types

// Use Route.LoaderArgs for typed params
export async function loader({ params }: Route.LoaderArgs) {
  const id = parseInt(params.id); // params.id is now typed as string by default

  if (isNaN(id)) {
    throw json({ message: "Invalid user ID" }, { status: 400 });
  }

  try {
    const user = await getUserById(id);
    if (!user) {
      throw json({ message: "User not found" }, { status: 404 }); // Throw JSON response for errors
    }
    return json({ user });
  } catch (error: any) {
    console.error(`Failed to fetch user ${id}:`, error);
    throw json(
      { message: error.message || "Failed to fetch user" },
      { status: error.status || 500 }
    );
  }
}

// Use Route.ActionArgs for typed params
export async function action({ params, request }: Route.ActionArgs) {
  const id = parseInt(params.id); // params.id is now typed as string by default

  if (isNaN(id)) {
    throw json({ message: "Invalid user ID" }, { status: 400 });
  }

  const formData = await request.formData();
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;

  // Basic validation
  if (!name || !email) {
    throw json({ message: "Name and email are required" }, { status: 400 });
  }

  try {
    const user = await updateUser(id, { name, email });
    if (!user) {
      throw json(
        { message: "User not found after update attempt" },
        { status: 404 }
      );
    }
    return json({ user, success: true }); // Return success flag
  } catch (error: any) {
    console.error(`Failed to update user ${id}:`, error);
    // Return error details in the response
    return json(
      { message: error.message || "Failed to update user" },
      { status: error.status || 500 }
    );
  }
}

export default function EditUser() {
  const { user } = useLoaderData<typeof loader>(); // Use typeof loader for type safety

  return (
    <div>
      <h1>Edit User</h1>

      <Form method="post">
        <input
          name="name"
          defaultValue={user.name}
          placeholder="Name"
          required
        />
        <input
          name="email"
          type="email"
          defaultValue={user.email}
          placeholder="Email"
          required
        />
        <button type="submit">Update User</button>
      </Form>
    </div>
  );
}
```

_Note: Dynamic segments like `$id` in the filename are available in `params` within `loader` and `action` arguments. Type generation with `react-router-typegen` provides types for these params._

## Best Practices

1.  **Schema Management**

    - Define schemas using Drizzle's type-safe builders
    - Use migrations for schema changes
    - Keep schema files organized and modular

2.  **Database Access**

    - Keep database logic in server-only files (\*.server.ts)
    - Use typed queries with interfaces
    - Implement proper error handling and throw `Response` objects for errors in loaders/actions.

3.  **Query Safety**

    - Use Drizzle's query builders to prevent SQL injection
    - Validate input data before queries (e.g., in actions)
    - Implement proper error handling

4.  **Performance**

    - Use connection pooling (as shown in `app/db/index.server.ts`)
    - Implement pagination for large datasets
    - Cache frequently accessed data

5.  **Type Safety**

    - Use Drizzle's type inference (`$inferSelect`, `$inferInsert`)
    - Use `react-router-typegen` to generate types for loaders, actions, and params.
    - Use `typeof loader` with `useLoaderData` for type safety.
    - Define proper interfaces where needed.
    - Implement proper validation.

## Security Considerations

1.  **Database Access**

    - Use least privilege database users
    - Enable SSL for database connections
    - Regularly rotate database credentials

2.  **Query Safety**

    - Use Drizzle's query builders to prevent SQL injection
    - Validate and sanitize all user inputs on the server (e.g., in actions)
    - Implement rate limiting

3.  **Data Protection**

    - Encrypt sensitive data at rest
    - Implement proper access controls based on user roles and permissions within your loaders and actions.
    - Regular security audits

## Troubleshooting

Common issues and solutions:

1.  **Connection Issues**

    - Verify `DATABASE_URL` format in `.env`.
    - Check network connectivity between your application and the database.
    - Ensure database credentials are correct.
    - If using SSL, ensure it's properly configured on both the client and server.

2.  **Migration Issues**

    - Check Drizzle schema syntax (`app/db/schema.ts`).
    - Verify `drizzle.config.ts` is correctly configured.
    - Ensure migration files in the `drizzle` directory are correct.
    - Run migrations in the correct order.
    - Check database permissions for the user running migrations.

3.  **Performance Problems**

    - Monitor query execution time using database tools.
    - Check for missing database indexes on frequently queried columns.
    - Optimize large or complex queries.
    - Consider database-level caching or application-level caching for hot data.

4.  **Routing or Data Issues**

    - Ensure your `@react-router/dev` and file-based routing setup is correct and the development server is running.
    - Check browser console and server logs for errors.
    - Verify loader and action function signatures and return types.
    - Use `useLoaderData` and `useActionData` hooks correctly in your components.
    - Ensure forms use `method="post"` for actions.
    - Check generated types from `react-router-typegen` for discrepancies.

## Additional Resources

- [React Router Documentation](https://www.google.com/search?q=https://reactrouter.com/docs/) (Pay close attention to the "Framework Guide")
- [Drizzle Documentation](https://orm.drizzle.team)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [`@react-router/dev` Documentation](https://www.google.com/search?q=https://github.com/remix-run/react-router/tree/main/packages/remix-dev) (or specific plugin docs)
- [`@react-router/fs-routes` Documentation](https://www.google.com/search?q=https://github.com/remix-run/react-router/tree/main/packages/remix-fs-routes)
