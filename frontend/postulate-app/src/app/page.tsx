"use client";
import { useState, useEffect } from "react";
import Home from "./components/home/home";
import { useUser } from "./context/userContext";
import LoginForm from "./components/auth/loginForm";

const LoginPage = () => {
  const { user, setUser } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkingSession, setCheckingSession] = useState(true); // start as true

  // Set anonymous user on mount
  useEffect(() => {
    const anonymousUser = {
      id: "anon-" + Math.random().toString(36).substring(2, 9),
      name: "Anonymous User",
      email: "anonymous@example.com",
    };

    setUser(anonymousUser);
    setCheckingSession(false);
  }, [setUser]);

  const handleSubmit = () => {
    if (isLogin) {
      login(email, password);
    } else {
      register();
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError("");
      console.log("login");
      // For now, just overwrite with anonymous user
      setUser({
        id: "anon-" + Math.random().toString(36).substring(2, 9),
        name: "Anonymous User",
        email: email || "anonymous@example.com",
      });
    } catch (err) {
      setError("Invalid email or password");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const register = async () => {
    try {
      setLoading(true);
      setError("");
      console.log("register");
      await login(email, password);
    } catch (err) {
      setError("Registration failed. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (user) {
    return <Home />;
  }

  return (
    <LoginForm
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      name={name}
      setName={setName}
      isLogin={isLogin}
      setIsLogin={setIsLogin}
      loading={loading}
      error={error}
      handleSubmit={handleSubmit}
    />
  );
};

export default LoginPage;
