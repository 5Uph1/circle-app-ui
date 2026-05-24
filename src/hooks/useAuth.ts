import { setToken, setUser, updateUser } from "@/store/authSlice";
import axios from "axios";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { API_URL } from "@/config/api";
import type { RootState } from "@/store/store";

export const useLoginManager = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${API_URL}/user/login`, form);
      const { token, fullname, username, user_id, email } = response.data.data;

      dispatch(setToken(token));
      localStorage.setItem("token", token);
      localStorage.setItem("fullname", fullname);
      localStorage.setItem("username", username);

      // 🔥 fetch /user/me untuk dapat count yang benar
      const meRes = await fetch(`${API_URL}/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const meData = await meRes.json();

      dispatch(
        setUser({
          id: user_id,
          username,
          fullname,
          email,
          bio: meData.data.bio,
          photo_profile: meData.data.photo_profile,
          following: meData.data._count.follower,
          follower: meData.data._count.following,
        }),
      );

      navigate("/");
      setForm({ email: "", password: "" });
    } catch (error: any) {
      console.error(error);
      setForm({ email: "", password: "" });
      alert(error.response?.data?.error || "Login gagal");
    }
  };

  return {
    handleChange,
    handleSubmit,
    form,
  };
};

export const useRegisterManager = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    fullname: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      console.log(form);
      const response = await axios.post(`${API_URL}/user/register`, form);

      console.log(response.data);

      alert("Register berhasil!");
      navigate("/login");
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.error || "Register gagal");
    }
  };

  return {
    handleSubmit,
    handleChange,
    form,
  };
};

export const useUpdateManager = () => {
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);

  const handleUpdate = async (e: React.FormEvent, onSuccess: () => void) => {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const formData = new FormData();

    const fullname = (form.elements.namedItem("fullname") as HTMLInputElement)
      ?.value;
    const bio = (form.elements.namedItem("bio") as HTMLInputElement)?.value;
    const photoFile = (
      form.elements.namedItem("photo_profile") as HTMLInputElement
    )?.files?.[0];

    if (fullname) formData.append("full_name", fullname);
    if (bio) formData.append("bio", bio);
    if (photoFile) formData.append("photo_profile", photoFile);

    try {
      const res = await fetch(`${API_URL}/user/edit`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Gagal update profile");

      const data = await res.json();

      // update redux state
      dispatch(
        updateUser({
          fullname: data.data.full_name,
          bio: data.data.bio,
          photo_profile: data.data.photo_profile,
        }),
      );

      onSuccess();
    } catch (err) {
      console.error("Update gagal:", err);
      alert("Gagal update profile");
    }
  };

  return { handleUpdate };
};
