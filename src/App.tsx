import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { HabitsPage } from "./habits/data";

const queryClient = new QueryClient();

const App = () => {
  return (
    <div>
      <header>
        <h1 class="p-6 text-4xl text-center font-bold text-blue-50">
          Welcome to the Crystal of Customs
        </h1>
      </header>
      <main>
        <QueryClientProvider client={queryClient}>
          <HabitsPage />
        </QueryClientProvider>
      </main>
    </div>
  );
};

export default App;
