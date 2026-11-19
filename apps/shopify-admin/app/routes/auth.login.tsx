
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "react-router";

import { login } from "../shopify.server";

export async function loader({ request }: LoaderFunctionArgs) {
  return await login(request);
}

export async function action({ request }: ActionFunctionArgs) {
  return await login(request);
}
