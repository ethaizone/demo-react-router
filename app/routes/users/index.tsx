import { getUsers, createUser, deleteUser } from "~/models/user.server";
import { Form, useLoaderData, type ActionFunctionArgs } from "react-router";

export async function loader() {
  try {
    const users = await getUsers();
    return {
      users,
    };
  } catch (error: any) {
    throw new Error(`Failed to fetch users: ${error.message}`);
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const action = formData.get("action");

  try {
    switch (action) {
      case "create": {
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const user = await createUser({ name, email, age: 0 });
        return { user };
      }

      case "delete": {
        const id = parseInt(formData.get("id") as string);
        await deleteUser(id);
        return { success: true };
      }

      default:
        throw new Error("Invalid action");
    }
  } catch (error: any) {
    throw new Error(`Failed to perform action: ${error.message}`);
  }
}

export default function Users() {
  const { users } = useLoaderData<typeof loader>();

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
