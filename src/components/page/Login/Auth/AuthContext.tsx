import React, { useContext, useEffect, useState } from "react";
import { IAuth } from "./interface/User.interface";
import axios from "../../../../config/axiosInstance";
import { CheckExpiredToken } from "common/checkExpiredToken";
import Swal from "sweetalert2";

const AuthContext = React.createContext<any>(null);
interface IAuthProps {
  children: any;
}

const AuthProvider = ({ children }: IAuthProps) => {
  const [accessToken, setAccessToken] = useState<any | null>();
  const [refreshToken, setRefreshToken] = useState<any | null>();
  const [user, setUser] = useState("");

  async function login({ emailOrUsername, password }: IAuth) {
    return await axios
      .post("/auth/signin", { emailOrUsername, password })
      .then((response) => {
        if (response.data.access_token)
          localStorage.setItem("accessToken", response.data.access_token);
        if (response.data.refresh_token)
          localStorage.setItem("refreshToken", response.data.refresh_token);
        setAccessToken(localStorage.getItem("accessToken"));
        setRefreshToken(localStorage.getItem("refreshToken"));
        setUser(response.data);
        console.log(accessToken);
        return user;
      })
      .catch((err) => {
        Swal.fire({
          icon: "error",
          title: "เข้าสู่ระบบไม่สำเร็จ",
          text: "กรุณาตรวจสอบชื่อผู้ใช้หรือรหัสผ่าน",
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: true,
        }).then(() => {
          window.location.reload();
        });
      });
  }

  async function refreshTokenFunc() {
    return await axios
      .post(
        "/auth/refreshToken",
        {},
        { headers: { Authorization: `Bearer ${refreshToken}` } }
      )
      .then((response) => {
        if (response.data.access_token)
          localStorage.setItem("accessToken", response.data.access_token);
        if (response.data.refresh_token)
          localStorage.setItem("refreshToken", response.data.refresh_token);
        setAccessToken(localStorage.getItem("accessToken"));
        setRefreshToken(localStorage.getItem("refreshToken"));
      })
      .catch((err) => {
        console.error("ERROR CANNOT LOGIN", err);
      });
  }

  async function logout() {
    const ac = await CheckExpiredToken();
    return axios
      .post("/auth/logout", {}, { headers: { Authorization: `Bearer ${ac}` } })
      .then((response) => {
        console.log("[Response Logout]", response.data);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/";
        return response.data;
      })
      .catch((err) => {
        console.error("ERROR CANNOT LOGIN", err);
      });
  }

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        login,
        logout,
        accessToken,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error(" error AuthContext");
  }
  return context;
};

export { AuthContext, AuthProvider, useAuthContext };
