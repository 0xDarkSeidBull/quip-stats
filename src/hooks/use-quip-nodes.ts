import { useEffect, useState, useCallback, useRef } from "react";
import {
  fetchAllNodes,
  loadCache,
  saveCache,
  mergeNodes,
  type QuipNode,
} from "@/lib/quipstats-api";

interface State {
  nodes: QuipNode[];      // merged (ever-seen)
  fresh: QuipNode[];      // last live snapshot
  loading: boolean;
  error: string | null;
  updatedAt: number | null;
  fromCache: boolean;
}

export function useQuipNodes(refreshMs = 30_000) {
  const [state, setState] = useState<State>({
    nodes: [],
    fresh: [],
    loading: true,
    error: null,
    updatedAt: null,
    fromCache: false,
  });
  const mounted = useRef(true);

  const refresh = useCallback(async (existing: QuipNode[]) => {
    try {
      const fresh = await fetchAllNodes();
      const merged = existing.length > 0 ? mergeNodes(existing, fresh) : fresh;
      saveCache(merged);
      if (!mounted.current) return;
      setState({
        nodes: merged,
        fresh,
        loading: false,
        error: null,
        updatedAt: Date.now(),
        fromCache: false,
      });
    } catch (e) {
      if (!mounted.current) return;
      setState((s) => ({
        ...s,
        loading: false,
        error: e instanceof Error ? e.message : "Failed to fetch",
      }));
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    const cache = loadCache();
    if (cache && cache.nodes.length > 0) {
      setState((s) => ({
        ...s,
        nodes: cache.nodes,
        loading: false,
        fromCache: true,
        updatedAt: cache.ts,
      }));
    }
    refresh(cache?.nodes ?? []);
    const id = setInterval(() => {
      // use latest nodes via functional state read
      setState((cur) => {
        refresh(cur.nodes);
        return cur;
      });
    }, refreshMs);
    return () => {
      mounted.current = false;
      clearInterval(id);
    };
  }, [refresh, refreshMs]);

  return state;
}
