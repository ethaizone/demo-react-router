import {
  Form,
  useLoaderData,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "react-router";
import { getUserById, updateUser } from "~/models/user.server";

export async function loader({ params }: LoaderFunctionArgs) {
  const id = parseInt(params.id!);

  try {
    const user = await getUserById(id);
    if (!user) {
      throw new Response("Not Found", { status: 404 });
    }
    return { user };
  } catch (error: any) {
    throw new Error(`Failed to fetch user: ${error.message}`);
  }
}

export async function action({ params, request }: ActionFunctionArgs) {
  const id = parseInt(params.id!);
  const formData = await request.formData();
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;

  try {
    const user = await updateUser(id, { name, email });
    return { user };
  } catch (error: any) {
    throw new Error(`Failed to update user: ${error.message}`);
  }
}

export default function EditUser() {
  const { user } = useLoaderData<typeof loader>();

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
