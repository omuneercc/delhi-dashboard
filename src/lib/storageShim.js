import { supabase } from "./supabaseClient";

// This mimics the window.storage.get/set/delete/list API the dashboard code
// already uses, but backs it with a real Postgres table in Supabase instead
// of Claude's artifact-only storage. That means the exact same App component
// code works unchanged — it just now syncs across every device you log into.

async function currentUserId() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  return user.id;
}

export const storage = {
  async get(key, shared = false) {
    const user_id = await currentUserId();
    const table = shared ? "app_data_shared" : "app_data";
    const { data, error } = await supabase
      .from(table)
      .select("value")
      .eq(shared ? "key" : "user_id", shared ? key : user_id)
      .eq(shared ? "user_id" : "key", shared ? user_id : key)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return { key, value: JSON.stringify(data.value), shared };
  },

  async set(key, value, shared = false) {
    const user_id = await currentUserId();
    const table = shared ? "app_data_shared" : "app_data";
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    const { error } = await supabase
      .from(table)
      .upsert({ user_id, key, value: parsed, updated_at: new Date().toISOString() }, { onConflict: "user_id,key" });
    if (error) throw error;
    return { key, value, shared };
  },

  async delete(key, shared = false) {
    const user_id = await currentUserId();
    const table = shared ? "app_data_shared" : "app_data";
    const { error } = await supabase.from(table).delete().eq("user_id", user_id).eq("key", key);
    if (error) throw error;
    return { key, deleted: true, shared };
  },

  async list(prefix = "", shared = false) {
    const user_id = await currentUserId();
    const table = shared ? "app_data_shared" : "app_data";
    let q = supabase.from(table).select("key").eq("user_id", user_id);
    if (prefix) q = q.like("key", `${prefix}%`);
    const { data, error } = await q;
    if (error) throw error;
    return { keys: (data || []).map((r) => r.key), prefix, shared };
  },
};

// Make it available globally so the existing dashboard code (which calls
// window.storage.get/.set/.delete/.list) works with zero changes.
window.storage = storage;
