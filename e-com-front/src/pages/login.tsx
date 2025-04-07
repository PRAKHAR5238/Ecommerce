import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useState } from "react";
import toast from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";
import { auth } from "../firebase";
import { useLoginUserMutation } from "../redux/api/Userapi";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { MessageResponse } from "../types/api-types";

const Login = () => {
  const [gender, setGender] = useState("");
  const [date, setDate] = useState("");
  const [loginUser] = useLoginUserMutation();

  const loginHandler = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(auth, provider);

      if (!user.email) {
        toast.error("Email is required for authentication.");
        return;
      }

      const res = await loginUser({
        email: user.email, 
        name: user.displayName ?? "No Name",
        gender, 
        role: "user", 
        dob: date, 
        photo: user.photoURL ?? "", 
        _id: user.uid, 
      });

      if (res?.data) {
        toast.success(res.data.message);
      } else if (res?.error) {
        const error = res.error as FetchBaseQueryError;
        const message = (error.data as MessageResponse | undefined)?.message || "An error occurred. Please try again.";
        toast.error(message);
      } else {
        toast.error("Unexpected response. Please try again.");
      }
    } catch (error) {
      console.error("Sign-in error:", error);
      toast.error("Sign-in failed. Please try again.");
    }
  };

  return (
    <div className="login">
      <main>
        <h1 className="heading">Login</h1>
        <div>
          <label htmlFor="gender">Gender</label>
          <select
            id="gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label htmlFor="date">Date of Birth</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div>
          <p>Already Signed In Once?</p>
          <button onClick={loginHandler}>
            <FcGoogle /> <span>Sign in With Google</span>
          </button>
        </div>
      </main>
    </div>
  );
};

export default Login;
