<script setup lang="ts">
const {
  todos,
  errorMessage,
  isLoading,
  readTodos,
  createTodo,
  updateTodo,
  deleteTodo,
} = useTodos();

const newTodoTitle = ref("");
const todoIdInEdit = ref<number | null>(null);
const todoTitleInEdit = ref<string | null>(null);
const todoDoneInEdit = ref<boolean | null>(null);

onMounted(async () => {
  await readTodos();
});

function startEdit(id: number, title: string, done: boolean) {
  todoIdInEdit.value = id;
  todoTitleInEdit.value = title;
  todoDoneInEdit.value = done;
}

function cancelEdit() {
  todoIdInEdit.value = null;
  todoTitleInEdit.value = null;
  todoDoneInEdit.value = null;
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape") {
    cancelEdit();
  }
};

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (!target.closest(".todo-edit")) {
    cancelEdit();
  }
};

onMounted(() => {
  document.addEventListener("keydown", handleKeydown);
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
  document.removeEventListener("click", handleClickOutside);
});

async function saveTodo() {
  if (!todoTitleInEdit.value?.trim()) {
    alert("タイトルを入力してください。");
    return;
  }

  if (todoIdInEdit.value !== null) {
    try {
      await updateTodo(todoIdInEdit.value, todoTitleInEdit.value, false);

      const index = todos.value.findIndex(todo => todo.id === todoIdInEdit.value);
      if (index !== -1) {
        todos.value[index].title = todoTitleInEdit.value;
      }

      cancelEdit();
    }
    catch (errorMessage) {
      console.error("Todo の更新に失敗しました。", errorMessage);
      alert("Todo の更新に失敗しました。");
    }
  }
}

async function toggleDone(id: number, done: boolean) {
  try {
    await updateTodo(id, "", !done);
    const index = todos.value.findIndex(todo => todo.id === id);
    if (index === -1) {
      todos.value[index].done = !done;
    }
  }
  catch (errorMessage) {
    console.error("Todo の状態切り替えに失敗しました。", errorMessage);
    alert("Todo の状態切り替えに失敗しました。");
  }
}

async function addTodo() {
  if (!newTodoTitle.value.trim()) {
    alert("タイトルを入力してください");
    return;
  }

  await createTodo(newTodoTitle.value);
  newTodoTitle.value = "";
}
</script>

<template>
  <div
    flex="~ col"
    items-center
    justify-center
    h-screen
    gap-4xl
  >
    <h1 text-8xl>
      Todos
    </h1>

    <div v-if="isLoading">
      Loading...
    </div>
    <div v-else-if="errorMessage">
      Error: {{ errorMessage }}
    </div>
    <ul
      v-else
      w-full
      max-w-md
      space-y-2
      text-4xl
    >
      <li
        v-for="todo in todos"
        :key="todo.id"
      >
        <div
          v-if="todoIdInEdit === todo.id"
          flex
          items-center
          gap-4
          class="todo-edit"
        >
          <input
            v-model="todo.done"
            type="checkbox"
            w-6
            h-6
            @change="toggleDone(todo.id, todo.done)"
          >
          <input
            v-model="todoTitleInEdit"
            type="text"
            text-green
            max-w-xs
            flex-1
            focus:outline-none
            focus:text-green
          >
          <button
            p-2
            text-2xl
            bg-green
            text-white
            rounded
            hover:bg-green-500
            @click="saveTodo"
          >
            保存
          </button>
        </div>
        <div
          v-else
          flex
          gap-4
        >
          <input
            v-model="todo.done"
            type="checkbox"
            w-6

            @change="toggleDone(todo.id, todo.done)"
          >
          <span
            flex-1
            max-w-xs
            :class="{ 'line-through decoration-green': todo.done }"
            @dblclick="startEdit(todo.id, todo.title, todo.done)"
          >
            {{ todo.title }}
          </span>
          <button
            type="button"
            p-2
            bg-red
            text-white
            rounded
            text-2xl
            hover:bg-red-500
            focus:outline-none
            @click="deleteTodo(todo.id)"
          >
            削除
          </button>
        </div>
      </li>

      <li>
        <form
          flex
          gap-4
          items-center
          @submit.prevent="addTodo"
        >
          <div w-6 />
          <input
            v-model="newTodoTitle"
            type="text"
            placeholder="new Todo"
            flex-1
            max-w-xs
            focus:outline-none
            focus:text-green
          >
          <button
            type="submit"
            p-2
            bg-green
            text-white
            rounded
            text-2xl
            hover:bg-green-500
          >
            追加
          </button>
        </form>
      </li>
    </ul>
  </div>
</template>
