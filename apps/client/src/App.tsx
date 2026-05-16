import { APP_NAME } from "@helpdesk/shared";
import { ThemeToggle } from "./components/theme-toggle";

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex itmes-center justify-between p-4 border-b">
        <h1 className="text-xl font-bold">HelpDesk</h1>
        <ThemeToggle />
      </header>

      <main className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Theme switching works!</p>
      </main>
    </div>
  );
}

export default App;
