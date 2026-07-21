import { Firestore } from "@google-cloud/firestore";
import { USE_MEMORY_STORE } from "./constants.js";

/**
 * Small key/value store used for OAuth bookkeeping (registered clients,
 * in-flight authorization requests, one-time grants, issued tokens).
 *
 * Firestore is used in production so state survives Cloud Run cold starts
 * and is shared across instances; an in-memory Map is used for local dev.
 */
export interface Store {
  get<T>(collection: string, id: string): Promise<T | undefined>;
  set<T>(collection: string, id: string, data: T): Promise<void>;
  delete(collection: string, id: string): Promise<void>;
}

class MemoryStore implements Store {
  private data = new Map<string, unknown>();

  private key(collection: string, id: string): string {
    return `${collection}/${id}`;
  }

  async get<T>(collection: string, id: string): Promise<T | undefined> {
    return this.data.get(this.key(collection, id)) as T | undefined;
  }

  async set<T>(collection: string, id: string, value: T): Promise<void> {
    this.data.set(this.key(collection, id), value);
  }

  async delete(collection: string, id: string): Promise<void> {
    this.data.delete(this.key(collection, id));
  }
}

class FirestoreStore implements Store {
  private db = new Firestore();

  async get<T>(collection: string, id: string): Promise<T | undefined> {
    const snap = await this.db.collection(collection).doc(id).get();
    return snap.exists ? (snap.data() as T) : undefined;
  }

  async set<T>(collection: string, id: string, value: T): Promise<void> {
    await this.db.collection(collection).doc(id).set(value as Record<string, unknown>);
  }

  async delete(collection: string, id: string): Promise<void> {
    await this.db.collection(collection).doc(id).delete();
  }
}

export function createStore(): Store {
  return USE_MEMORY_STORE ? new MemoryStore() : new FirestoreStore();
}
