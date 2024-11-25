import type { Todo } from "@prisma/client";

export function useTodos() {
  const todos = ref<Todo[]>([]);
  const errorMessage = ref<string | null>(null);
  const status = ref<"idle" | "pending" | "success" | "error">("idle");

  const isLoading = computed(() => status.value === "pending");

  const readTodos = async () => {
    const { data, error, status: fetchStatus, refresh } = await useFetch<Todo[]>("/api/todos");

    status.value = fetchStatus.value;
    if (fetchStatus.value === "error") {
      errorMessage.value = error.value?.message || "データの取得に失敗しました。";
    }
    else {
      todos.value = data.value || [];
    }

    return { refresh };
  };

  const createTodo = async (title: string) => {
    if (!title.trim()) {
      errorMessage.value = "タイトルは必須です。";
      status.value = "error";
      return;
    }

    const { data, error, status: fetchStatus } = await useFetch<Todo>("/api/todos", {
      method: "POST",
      body: { title },
    });

    status.value = fetchStatus.value;
    if (fetchStatus.value === "error") {
      errorMessage.value = error.value?.message || "作成に失敗しました。";
    }
    else if (data.value) {
      todos.value.push(data.value);
    }
  };

  const updateTodo = async (id: number, title?: string, done?: boolean) => {
    const body: Partial<{ title: string; done: boolean }> = {};

    if (title !== undefined) body.title = title;
    if (done !== undefined) body.done = done;

    if (Object.keys(body).length === 0) {
      console.warn("更新する項目が指定されていません。");
      return;
    }

    const { data, error, status: fetchStatus } = await useFetch<Todo>(`/api/todos/${id}`, {
      method: "PATCH",
      body,
    });

    status.value = fetchStatus.value;

    if (fetchStatus.value === "error") {
      errorMessage.value = error.value?.message || "更新に失敗しました。";
    }
    else if (data.value) {
      const index = todos.value.findIndex(todo => todo.id === id);
      if (index !== -1) {
        todos.value[index] = { ...todos.value[index], ...data.value };
      }
    }
  };

  const deleteTodo = async (id: number) => {
    const { error, status: fetchStatus } = await useFetch(`/api/todos/${id}`, {
      method: "DELETE",
    });

    status.value = fetchStatus.value;
    if (fetchStatus.value === "error") {
      errorMessage.value = error.value?.message || "削除に失敗しました。";
    }
    else {
      todos.value = todos.value.filter(todo => todo.id !== id);
    }
  };

  return {
    todos,
    errorMessage,
    status,
    isLoading,
    readTodos,
    createTodo,
    updateTodo,
    deleteTodo,
  };
}
