import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import {
  searchUsers,
} from "@/store/userSlice";

export const useSearchUser = () => {
  const dispatch = useDispatch<any>();
  const { list, loading } = useSelector((state: any) => state.user.search);

  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!query) return;

    const delay = setTimeout(() => {
      dispatch(searchUsers(query));
    }, 400);

    return () => clearTimeout(delay);
  }, [query, dispatch]);

  return {
    query,
    setQuery,
    users: list,
    loading,
  };
};
