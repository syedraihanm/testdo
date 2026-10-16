
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import "./App.css";

const db = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

  async function loadTasks() {
    const { data, error } = await db
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) setError(error.message);
    else {
      setTasks(data);
      setError("");
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  async function addTask(e) {
    e.preventDefault();
    if (!title.trim()) return;

    const { error } = await db
      .from("tasks")
      .insert({ title: title.trim() });

    if (error) setError(error.message);
    else {
      setTitle("");
      loadTasks();
    }
  }

  async function toggleTask(task) {
    const { error } = await db
      .from("tasks")
      .update({ completed: !task.completed })
      .eq("id", task.id);

    if (error) setError(error.message);
    else loadTasks();
  }

  async function deleteTask(id) {
    const { error } = await db.from("tasks").delete().eq("id", id);

    if (error) setError(error.message);
    else loadTasks();
  }

  return (
    <main className="app">
      <h1>My Tasks</h1>
      <p>Simple tasks. Real database.</p>

      <form onSubmit={addTask}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter a task..."
        />
        <button>Add</button>
      </form>

      {error && <p className="error">{error}</p>}

      {tasks.map((task) => (
        <div className="task" key={task.id}>
          <span
            onClick={() => toggleTask(task)}
            className={task.completed ? "done" : ""}
          >
            {task.title}
          </span>
          <button onClick={() => deleteTask(task.id)}>
            Delete
          </button>
        </div>
      ))}
    </main>
  );
}
