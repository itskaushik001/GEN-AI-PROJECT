import { useContext, useEffect } from "react";
import { AuthContext } from "../auth.context";
import { login, register, logout, getMe } from "../services/auth.api";

export const useAuth = () => {
    const context = useContext(AuthContext);
    const { user, setUser, loading, setLoading } = context;

    const handleLogin = async ({ email, password }) => {
        setLoading(true);
        try {
            const data = await login({ email, password });
            setUser(data.user);
            return { success: true }; // ⭐ Tells Login.jsx it worked!
        } catch (err) {
            console.error("Login Error:", err);
            // Extracts the specific error message your backend sends (e.g., "Invalid Password")
            const errorMessage = err.response?.data?.message || "Login failed. Please try again.";
            return { success: false, message: errorMessage }; // ⭐ Tells Login.jsx it failed!
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async ({ username, email, password }) => {
        setLoading(true);
        try {
            const data = await register({ username, email, password });
            setUser(data.user);
            return { success: true }; 
        } catch (err) {
            console.error("Registration Error:", err);
            const errorMessage = err.response?.data?.message || "Registration failed.";
            return { success: false, message: errorMessage }; 
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        setLoading(true);
        try {
            await logout();
            setUser(null);
            return { success: true };
        } catch (err) {
            console.error("Logout Error:", err);
            return { success: false, message: "Failed to log out cleanly." };
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const getAndSetUser = async () => {
            try {
                const data = await getMe();
                setUser(data.user);
            } catch (err) {
                console.log("No active user session found.");
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        getAndSetUser();
    }, [setUser, setLoading]);

    return { user, loading, handleRegister, handleLogin, handleLogout };
};
