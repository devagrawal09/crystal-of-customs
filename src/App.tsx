import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { HabitsPage } from "./habits/data";

const queryClient = new QueryClient();

const App = () => {
  return (
    <div>
      <QueryClientProvider client={queryClient}>
        <HabitsPage />
      </QueryClientProvider>
    </div>
  );
};

export default App;
