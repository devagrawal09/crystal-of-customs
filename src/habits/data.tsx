import { createSignal, For, JSX, Show } from "solid-js";
import {
  createMutation,
  createQuery,
  useQueryClient,
} from "@tanstack/solid-query";
import { credentials, setCredentials } from "./credentials";
import { calculateAverageScore, getHabits, getUser, scoreTask } from "./api";
import showdown from "showdown";
import logo from "../assets/logo.png";

const converter = new showdown.Converter();

export interface UserData {
  profile: { name: string };
  _id: string;
}

export const HabitsPage = () => {
  const userDataQuery = createQuery(() => [`user`, credentials()], getUser, {
    retry: false,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  return (
    <Show when={credentials()} fallback={<UserForm />}>
      {() => (
        <>
          <header class="flex justify-between mx-3">
            <img src={logo} width={150} height={150} />
            <div class="text-center">
              <h1 class="pt-6 pb-3 text-4xl font-bold text-blue-50">
                Welcome to the Crystal of Customs
              </h1>
              <Show when={userDataQuery.status === "loading"}>
                <div class="text-blue-50 text-2xl">Loading User Data...</div>
              </Show>
              <Show when={userDataQuery.status === "error"}>
                <div class="text-blue-50 text-2xl">
                  Error: {(userDataQuery.error as any).message}
                </div>
              </Show>
              <Show when={userDataQuery.status === "success"}>
                <h2 class="text-blue-50 text-2xl">
                  Hail and well met, {userDataQuery.data?.profile.name}!
                </h2>
                <div class="text-red-50 text-lg">
                  Lo and behold, thy roster of duties and aspirations for thine
                  self-betterment quest. <br />
                </div>
              </Show>
            </div>
            <div style={{ width: `150px` }} class="text-right">
              <button
                class="mt-8 py-2 px-4 btn-glow rounded"
                onClick={() => setCredentials(undefined)}
              >
                Logout
              </button>
            </div>
          </header>
          <main>
            <HabitsGrid />
          </main>
        </>
      )}
    </Show>
  );
};

export const LogoutButton = () => {
  return (
    <Show when={credentials()}>
      {() => (
        <button
          class="absolute top-10 right-5 py-2 px-4 btn-glow rounded"
          onClick={() => setCredentials(undefined)}
        >
          Logout
        </button>
      )}
    </Show>
  );
};

const UserForm = () => {
  return (
    <>
      <header>
        <h1 class="p-6 text-4xl text-center font-bold text-blue-50">
          Welcome to the Crystal of Customs
        </h1>
      </header>
      <main>
        <form
          class="font-semibold w-1/3 grid grid-cols-3 gap-6 my-3 mx-auto"
          onSubmit={(e) => {
            try {
              e.preventDefault();
              const userId = e.currentTarget.userId.value;
              const token = e.currentTarget.token.value;

              if (!userId || !token) {
                throw new Error("Please enter a valid user ID and token.");
              }

              setCredentials({ userId, token });
            } catch (e: any) {
              console.error(e);
              alert(e.message);
            }
          }}
        >
          <label for="userId" class="text-glow">
            User ID
          </label>
          <input
            type="text"
            id="userId"
            class="text-black rounded glow col-span-2 py-1"
          />
          <label for="token" class="text-glow">
            Token
          </label>
          <input
            type="password"
            id="token"
            class="text-black rounded glow col-span-2 py-1"
          />
          <button
            type="submit"
            class="border w-full col-span-3 transition-all btn-glow p-1"
          >
            Submit
          </button>
        </form>
      </main>
    </>
  );
};

const HabitsGrid = () => {
  const qc = useQueryClient();
  const habitsQuery = createQuery(() => [`habits`, credentials()], getHabits, {
    retry: false,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });

  const scoreHabitMutation = createMutation(scoreTask, {
    onSuccess: () => qc.invalidateQueries(["habits"]),
  });

  const [showNotes, setShowNotes] = createSignal(false);
  const [showValue, setShowValue] = createSignal(false);

  return (
    <div class="text-center">
      <Show when={habitsQuery.status === "loading"}>
        <div class="text-blue-50 text-2xl">Loading Habits...</div>
      </Show>
      <Show when={habitsQuery.status === "error"}>
        <div class="text-blue-50 text-2xl">
          Error: {(habitsQuery.error as any).message}
        </div>
      </Show>
      <Show when={habitsQuery.status === "success"}>
        <div class="text-white text-lg">
          Thy current tally standeth at{" "}
          {calculateAverageScore(habitsQuery.data || [])} marks.
        </div>
        <div class="flex justify-center gap-4 m-3">
          <button
            class="btn-glow rounded border p-1 m-1"
            onClick={() => setShowValue((current) => !current)}
          >
            {showValue() ? "Hide" : "Show"} Values
          </button>
          <button
            class="btn-glow rounded border p-1 m-1"
            onClick={() => setShowNotes((current) => !current)}
          >
            {showNotes() ? "Hide" : "Show"} Notes
          </button>
          <button
            class="btn-glow rounded border p-1 m-1"
            onClick={() => qc.invalidateQueries(["habits"])}
          >
            Refresh
          </button>
        </div>
        <div class="grid gap-6 m-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          <For each={habitsQuery.data}>
            {(habit) => (
              <HabitCard value={habit.value}>
                <div class="p-2 flex-grow">
                  <div
                    class="text-lg font-semibold"
                    innerHTML={converter.makeHtml(habit.text)}
                  />
                  <Show when={showValue()}>
                    <div class="text-sm">Value: {habit.value.toFixed(2)}</div>
                  </Show>
                  <Show when={showNotes()}>
                    <div
                      class="text-sm"
                      innerHTML={converter.makeHtml(habit.notes) || "No notes"}
                    />
                  </Show>
                </div>
                <div class="grid grid-cols-2">
                  <div class="p-1">
                    <Show
                      when={habit.down}
                      fallback={
                        <HabitButton value={habit.value}>
                          -{habit.counterDown}
                        </HabitButton>
                      }
                    >
                      <HabitButton
                        value={habit.value}
                        onClick={() =>
                          scoreHabitMutation.mutate({
                            taskId: habit._id,
                            direction: "down",
                          })
                        }
                        disabled={
                          scoreHabitMutation.isLoading &&
                          scoreHabitMutation.variables?.taskId === habit._id &&
                          scoreHabitMutation.variables.direction === "down"
                        }
                      >
                        -{habit.counterDown}
                      </HabitButton>
                    </Show>
                  </div>
                  <div class="p-1">
                    <Show
                      when={habit.up}
                      fallback={
                        <HabitButton value={habit.value}>
                          +{habit.counterUp}
                        </HabitButton>
                      }
                    >
                      <HabitButton
                        value={habit.value}
                        onClick={() => {
                          console.log("clicked");
                          scoreHabitMutation.mutate({
                            taskId: habit._id,
                            direction: "up",
                          });
                        }}
                        disabled={
                          scoreHabitMutation.isLoading &&
                          scoreHabitMutation.variables?.taskId === habit._id &&
                          scoreHabitMutation.variables.direction === "up"
                        }
                      >
                        +{habit.counterUp}
                      </HabitButton>
                    </Show>
                  </div>
                </div>
                <HabitPriority priority={habit.priority} />
              </HabitCard>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
};

const HabitCard = (props: { value: number; children: JSX.Element }) => {
  return (
    <div
      class={`rounded shadow-inner ${
        props.value > 10
          ? "bg-blue-600 text-white shadow-blue-800"
          : props.value > 5
          ? "bg-sky-500 text-black shadow-sky-800"
          : props.value > 1
          ? "bg-green-500 text-black shadow-green-800"
          : props.value > -1
          ? "bg-yellow-500 text-black shadow-yellow-800"
          : props.value > -10
          ? "bg-orange-500 text-black shadow-orange-800"
          : props.value > -20
          ? "bg-red-500 text-white shadow-red-800"
          : "bg-red-700 text-white shadow-red-900"
      } hover:scale-105 transition flex flex-col`}
    >
      {props.children}
    </div>
  );
};

const HabitButton = (props: {
  value: number;
  children: JSX.Element;
  onClick?: () => void;
  disabled?: boolean;
}) => {
  if (!props.onClick) {
    return (
      <button
        onClick={props.onClick}
        disabled={props.disabled}
        class="rounded-full disabled:text-gray-600 text-2xl w-12 h-12 bg-gray-500 text-white cursor-not-allowed"
      >
        {props.children}
      </button>
    );
  }

  if (props.value > 10) {
    return (
      <button
        onClick={props.onClick}
        disabled={props.disabled}
        class="rounded-full disabled:text-gray-600 text-2xl w-12 h-12 bg-blue-700 text-white hover:bg-blue-800"
      >
        {props.children}
      </button>
    );
  }

  if (props.value > 5) {
    return (
      <button
        onClick={props.onClick}
        disabled={props.disabled}
        class="rounded-full disabled:text-gray-600 text-2xl w-12 h-12 bg-sky-600 text-black hover:bg-sky-700"
      >
        {props.children}
      </button>
    );
  }

  if (props.value > 1) {
    return (
      <button
        onClick={props.onClick}
        disabled={props.disabled}
        class="rounded-full disabled:text-gray-600 text-2xl w-12 h-12 bg-green-600 text-black hover:bg-green-700"
      >
        {props.children}
      </button>
    );
  }

  if (props.value > -1) {
    return (
      <button
        onClick={props.onClick}
        disabled={props.disabled}
        class="rounded-full disabled:text-gray-600 text-2xl w-12 h-12 bg-yellow-600 text-black hover:bg-yellow-700"
      >
        {props.children}
      </button>
    );
  }

  if (props.value > -10) {
    return (
      <button
        onClick={props.onClick}
        disabled={props.disabled}
        class="rounded-full disabled:text-gray-600 text-2xl w-12 h-12 bg-orange-600 text-black hover:bg-orange-700"
      >
        {props.children}
      </button>
    );
  }

  if (props.value > -20) {
    return (
      <button
        onClick={props.onClick}
        disabled={props.disabled}
        class="rounded-full disabled:text-gray-600 text-2xl w-12 h-12 bg-red-600 text-white hover:bg-red-700"
      >
        {props.children}
      </button>
    );
  }

  return (
    <button
      onClick={props.onClick}
      class="rounded-full disabled:text-gray-600 text-2xl w-12 h-12 bg-red-900 text-white hover:bg-red-800"
    >
      {props.children}
    </button>
  );
};

const HabitPriority = (props: { priority: number }) => {
  if (props.priority === 2) {
    return (
      <div class="w-full bg-red-400 text-black text-sm font-bold mt-1 rounded-b">
        Hard
      </div>
    );
  }

  if (props.priority === 1.5) {
    return (
      <div class="w-full bg-orange-400 text-black text-sm font-bold mt-1 rounded-b">
        Medium
      </div>
    );
  }

  if (props.priority === 1) {
    return (
      <div class="w-full bg-yellow-400 text-black text-sm font-bold mt-1 rounded-b">
        Easy
      </div>
    );
  }

  if (props.priority === 0.1) {
    return (
      <div class="w-full bg-green-400 text-black text-sm font-bold mt-1 rounded-b">
        Trivial
      </div>
    );
  }
};
