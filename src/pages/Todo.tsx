import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  type: "plan" | "custom";
}

const Todo = () => {
  const navigate = useNavigate();
  const supabase = useSupabaseClient();
  const user = useUser();

  const [activeTab, setActiveTab] = useState<"plan" | "new">("plan");
  const [newTask, setNewTask] = useState("");
  const [planItems, setPlanItems] = useState<TodoItem[]>([]);
  const [customItems, setCustomItems] = useState<TodoItem[]>([]);

  // Fetch plan todos from Supabase
  useEffect(() => {
    if (!user) return;
    const loadPlan = async () => {
      const { data, error } = await supabase
        .from("user_todos")
        .select("id, text, completed")
        .eq("user_id", user.id)
        .eq("type", "plan")
        .order("created_at", { ascending: true });

      if (error || !data?.[0]) return;

      const fetched = data[0];
      const todos: TodoItem[] = fetched.text.map((text: string, index: number) => ({
        id: `plan-${index}`,
        text,
        completed: fetched.completed[index],
        type: "plan",
      }));
      setPlanItems(todos);
    };
    loadPlan();
  }, [user]);

  // Fetch custom todos from Supabase
  useEffect(() => {
    if (!user) return;
    const loadCustom = async () => {
      const { data, error } = await supabase
        .from("user_todos")
        .select("id, text, completed")
        .eq("user_id", user.id)
        .eq("type", "custom")
        .order("created_at", { ascending: false });

      if (error || !data?.length) return;

      const todos: TodoItem[] = data.map((row: any) => ({
        id: row.id,
        text: row.text[0],
        completed: row.completed[0],
        type: "custom",
      }));
      setCustomItems(todos);
    };
    loadCustom();
  }, [user]);

  const togglePlanItem = async (index: number) => {
    if (!user || !planItems.length) return;
    const updated = planItems.map((item, i) => ({
      ...item,
      completed: i <= index ? !item.completed : item.completed,
    }));
    setPlanItems(updated);

    const textArray = updated.map((i) => i.text);
    const completedArray = updated.map((i) => i.completed);
    await supabase
      .from("user_todos")
      .update({ text: textArray, completed: completedArray })
      .eq("user_id", user.id)
      .eq("type", "plan");
  };

  const resetPlanTodos = async () => {
    if (!user) return;
    await supabase.from("user_todos").delete().eq("user_id", user.id).eq("type", "plan");
    setPlanItems([]);
  };

  const addNewTask = async () => {
    if (!newTask.trim() || !user) return;

    const { data, error } = await supabase
      .from("user_todos")
      .insert([
        {
          user_id: user.id,
          type: "custom",
          text: [newTask],
          completed: [false],
        },
      ])
      .select()
      .single();

    if (!error) {
      setCustomItems((prev) => [
        ...prev,
        {
          id: data.id,
          text: data.text[0],
          completed: false,
          type: "custom",
        },
      ]);
      setNewTask("");
    }
  };

  const toggleCustom = async (id: string) => {
    const item = customItems.find((i) => i.id === id);
    if (!item || !user) return;

    const updated = { ...item, completed: !item.completed };
    await supabase
      .from("user_todos")
      .update({ completed: [updated.completed] })
      .eq("id", id);

    setCustomItems((prev) => prev.map((t) => (t.id === id ? updated : t)));
  };

  const deleteCustom = async (id: string) => {
    await supabase.from("user_todos").delete().eq("id", id);
    setCustomItems((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-foreground">To - Do</h1>
        <button
          onClick={() => navigate("/dashboard")}
          className="w-10 h-10 rounded-full bg-white flex items-center justify-center"
        >
          <X className="w-5 h-5 text-black" />
        </button>
      </div>

      <Card className="tool-card bg-todo text-black">
        <div className="flex mb-6">
          <Button
            onClick={() => setActiveTab("plan")}
            className={`flex-1 h-12 rounded-full mr-2 font-semibold ${
              activeTab === "plan"
                ? "bg-white text-black border-2 border-black"
                : "bg-transparent text-black border-2 border-black"
            }`}
          >
            Plan
          </Button>
          <Button
            onClick={() => setActiveTab("new")}
            className={`flex-1 h-12 rounded-full ml-2 font-semibold ${
              activeTab === "new"
                ? "bg-black text-white"
                : "bg-transparent text-black border-2 border-black"
            }`}
          >
            New List
          </Button>
        </div>

        {/* Plan Tab */}
        {activeTab === "plan" && (
          <div className="space-y-3">
            {planItems.map((item, idx) => (
              <div
                key={item.id}
                className={`flex items-center p-4 border-2 border-black rounded-lg transition-all ${
                  item.completed ? "bg-black/10 opacity-60" : "bg-transparent"
                }`}
              >
                <button
                  onClick={() => togglePlanItem(idx)}
                  className={`w-6 h-6 border-2 border-black rounded mr-4 flex items-center justify-center ${
                    item.completed ? "bg-black" : "bg-transparent"
                  }`}
                >
                  {item.completed && (
                    <span className="text-white text-sm">✓</span>
                  )}
                </button>
                <span
                  className={`flex-1 font-medium ${
                    item.completed ? "line-through text-black/60" : ""
                  }`}
                >
                  {item.text}
                </span>
              </div>
            ))}
            {planItems.length > 0 && (
              <div className="text-center pt-4">
                <button
                  onClick={resetPlanTodos}
                  className="px-4 py-2 text-sm font-semibold bg-red-500 hover:bg-red-600 text-white rounded-full transition"
                >
                  Reset Plan
                </button>
              </div>
            )}
            {planItems.length === 0 && (
              <div className="text-center text-black/60 py-8">
                Plan has been reset. Create a new plan to get started.
              </div>
            )}
          </div>
        )}

        {/* New List */}
        {activeTab === "new" && (
          <div>
            <div className="flex mb-6">
              <Input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Add new task..."
                className="bg-todo/20 border-black text-black placeholder:text-black/60 mr-2"
                onKeyDown={(e) => e.key === "Enter" && addNewTask()}
              />
              <Button onClick={addNewTask} className="px-4 bg-black text-white">
                <Plus size={20} />
              </Button>
            </div>
            <div className="space-y-3">
              {customItems.map((todo) => (
                <div
                  key={todo.id}
                  className={`flex items-center p-4 border-2 border-black rounded-lg transition-all ${
                    todo.completed ? "bg-black/10 opacity-60" : "bg-transparent"
                  }`}
                >
                  <button
                    onClick={() => toggleCustom(todo.id)}
                    className={`w-6 h-6 border-2 border-black rounded mr-4 flex items-center justify-center ${
                      todo.completed ? "bg-black" : "bg-transparent"
                    }`}
                  >
                    {todo.completed && (
                      <span className="text-white text-sm">✓</span>
                    )}
                  </button>
                  <span
                    className={`flex-1 font-medium ${
                      todo.completed ? "line-through text-black/60" : ""
                    }`}
                  >
                    {todo.text}
                  </span>
                  <button
                    onClick={() => deleteCustom(todo.id)}
                    className="ml-2 p-1 text-destructive rounded"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              {customItems.length === 0 && (
                <div className="text-center text-black/60 py-8">
                  No custom tasks yet. Add one above!
                </div>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Todo;
