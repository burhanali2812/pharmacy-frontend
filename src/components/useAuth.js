import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { showToast } from "./Toastify2";
const useAuth = () => {
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();  

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        console.log("Checking Token:", storedToken);

        if (!storedToken) {
            console.log("No token found, redirecting...");
            setIsLoading(false);
            navigate("/login"); 
            return;
        }

        setToken(storedToken);
        setIsLoading(false); 

        try {
            const decoded = JSON.parse(atob(storedToken.split(".")[1]));
            console.log("Decoded Token:", decoded);

            if (decoded.exp * 1000 < Date.now()) {
                localStorage.removeItem("token");
                showToast("error","Login Expired, Please Login Again", 5000);
                navigate("/login"); 
            }
        } catch (error) {
            console.error("Invalid token:", error);
            localStorage.removeItem("token");
            navigate("/login");
        }
    }, [navigate]);  // Add navigate to dependencies

    return isLoading ? null : token;
};

export default useAuth;
