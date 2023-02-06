import { createEffect, createSignal } from "solid-js";

export type Credentials = { userId: string; token: string };
export const [credentials, setCredentials] = createSignal<Credentials>();

const storedCredentials = localStorage.getItem("credentials");
if (storedCredentials) {
  setCredentials(JSON.parse(storedCredentials));
}

createEffect(() => {
  const creds = credentials();
  if (creds) {
    localStorage.setItem("credentials", JSON.stringify(creds));
  } else {
    localStorage.removeItem("credentials");
  }
});
