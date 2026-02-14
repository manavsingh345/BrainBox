import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { Button } from "../component/UI/Button";
import { Link } from "react-router-dom";

export function Signup() {

  const usernameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const signup = async () => {
    if (isSubmitting) return;
    setErrorMessage("");

    const username = usernameRef.current?.value;
    const email = emailRef.current?.value;
    const password = passwordRef.current?.value;
    const confirmPassword = confirmPasswordRef.current?.value;

    if (!username || !email || !password || !confirmPassword) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      setIsSubmitting(true);
      await axios.post(`${BACKEND_URL}/api/v1/signup`, {
        username,
        email,
        password,
      });
      navigate("/signin");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const backendMessage = error.response?.data?.message || error.response?.data?.error;
        setErrorMessage(backendMessage || "Signup failed. Please try again.");
      } else {
        setErrorMessage("Signup failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen dashboard-grid flex items-center justify-center text-white">
        <div className="absolute w-[500px] h-[500px] bg-gray-500 opacity-70 rounded-full blur-[160px] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0"></div>
      <div className="relative z-10 w-full max-w-md p-8 rounded-xl bg-gradient-to-br space-y-4 ">
        <div className="flex justify-center mb-14">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 690.6" className="w-10 h-10 fill-red ">
                    <path d="M718.55 285.77c-3.53-20.72-13.28-39.59-28.24-54.59-16.34-16.3-37.24-26.33-59.8-28.95v-27.28c0-5.74-.49-11.51-1.46-17.13-3.52-20.72-13.28-39.59-28.24-54.59-16.28-16.25-37.11-26.27-59.6-28.93-4.63-16.79-13.44-32.07-25.96-44.62C496.08 10.54 470.62 0 443.56 0c-35.72 0-67.51 18.38-85.6 46.89-3.93-6.15-8.52-11.94-13.78-17.22C324.99 10.54 299.53 0 272.47 0c-46.16 0-85.74 30.7-97.71 74.29-44.16 5.26-80.14 38.75-87.75 83.49-.97 5.65-1.46 11.42-1.46 17.15v27.86C37.24 210.45 0 252.65 0 302.9v84.8c0 5.73.49 11.51 1.46 17.13 3.52 20.72 13.28 39.59 28.24 54.59 15.38 15.35 34.81 25.15 55.86 28.43v27.78c0 5.74.49 11.51 1.46 17.13 3.52 20.72 13.28 39.58 28.24 54.59 16.28 16.24 37.09 26.26 59.56 28.92 4.62 16.8 13.44 32.09 25.97 44.66 19.18 19.13 44.64 29.67 71.7 29.67 35.72 0 67.5-18.38 85.6-46.89 3.93 6.15 8.52 11.94 13.78 17.22 19.17 19.13 44.63 29.67 71.7 29.67 46.17 0 85.76-30.71 97.72-74.32 44.17-5.25 80.15-38.74 87.76-83.49.97-5.65 1.47-11.42 1.47-17.16v-27.26c50.22-5.93 89.49-49.06 89.49-100.67v-84.8c0-5.73-.49-11.5-1.45-17.13ZM85.56 430.83v24.7c-12.56-2.91-24.11-9.19-33.45-18.51-10.28-10.31-16.99-23.27-19.41-37.52-.67-3.88-1-7.85-1-11.79v-84.8c0-32.8 23.1-60.58 53.86-67.8v24.65c0 35.79 18.9 67.49 47.22 85.54-28.32 18.06-47.22 49.76-47.22 85.54Zm513.25 84.8c0 3.94-.34 7.91-1.01 11.82-4.79 28.18-25.98 49.81-52.85 56.02V456.34c8.51-5.3 14.19-14.72 14.19-25.49 0-16.59-13.45-30.04-30.04-30.04s-30.04 13.45-30.04 30.04c0 10.77 5.68 20.18 14.19 25.49v132.88c0 3.94-.34 7.91-1.01 11.82-5.71 33.54-34.59 57.88-68.69 57.88-18.61 0-36.12-7.25-49.28-20.38-10.28-10.3-16.99-23.27-19.41-37.52-.67-3.88-1-7.85-1-11.79v-60.44c8.51-5.3 14.19-14.72 14.19-25.49 0-16.59-13.45-30.04-30.04-30.04s-30.04 13.45-30.04 30.04c0 10.77 5.68 20.18 14.19 25.49v60.44c0 3.94-.34 7.91-1.01 11.82-5.71 33.54-34.59 57.88-68.69 57.88-18.61 0-36.12-7.25-49.28-20.38-10.28-10.31-16.99-23.27-19.41-37.51-.67-3.89-1-7.86-1-11.8v-132.9c8.51-5.3 14.19-14.72 14.19-25.49 0-16.59-13.45-30.04-30.04-30.04s-30.04 13.45-30.04 30.04c0 10.77 5.68 20.18 14.19 25.49v127.13c-12.55-2.91-24.09-9.19-33.42-18.5-10.28-10.31-16.99-23.27-19.41-37.52-.67-3.88-1-7.85-1-11.79v-84.8c0-37.9 30.81-69.15 68.68-69.66l.88-.03 1.16.03c37.87.51 68.68 31.76 68.68 69.66V601.2h31.7V430.86c0-35.79-18.9-67.49-47.22-85.54 28.32-18.06 47.22-49.76 47.22-85.54V89.4h-31.7v170.35c0 37.9-30.81 69.15-68.68 69.66l-.97.05-1.07-.05c-37.87-.51-68.68-31.76-68.68-69.66v-84.8c0-3.94.34-7.91 1.01-11.82 4.79-28.17 25.97-49.79 52.83-56.01v127.16c-8.51 5.3-14.19 14.72-14.19 25.49 0 16.59 13.45 30.04 30.04 30.04s30.04-13.45 30.04-30.04c0-10.77-5.68-20.18-14.19-25.49V101.39c0-3.94.34-7.91 1.01-11.82 5.71-33.54 34.59-57.88 68.69-57.88 18.61 0 36.12 7.25 49.28 20.38 10.28 10.31 16.99 23.27 19.41 37.52.67 3.89 1 7.86 1 11.8v59.46c-8.51 5.3-14.19 14.72-14.19 25.49 0 16.59 13.45 30.04 30.04 30.04s30.04-13.45 30.04-30.04c0-10.77-5.68-20.18-14.19-25.49v-59.46c0-3.94.34-7.91 1.01-11.82 5.7-33.54 34.59-57.88 68.68-57.88 18.61 0 36.12 7.25 49.28 20.38 10.28 10.31 16.99 23.27 19.41 37.52.67 3.89 1 7.86 1 11.8v132.88c-8.51 5.3-14.19 14.72-14.19 25.49 0 16.59 13.45 30.04 30.04 30.04s30.04-13.45 30.04-30.04c0-10.77-5.68-20.18-14.19-25.49V107.12c12.56 2.91 24.11 9.19 33.45 18.51 10.28 10.31 16.99 23.27 19.41 37.52.67 3.88 1 7.84 1 11.79v84.8c0 37.9-30.81 69.15-68.68 69.66l-.95.05-1.08-.05c-37.87-.51-68.68-31.76-68.68-69.66V89.4h-31.7v170.35c0 35.79 18.9 67.49 47.22 85.54-28.32 18.06-47.22 49.76-47.22 85.54v170.34h31.7V430.83c0-37.9 30.81-69.15 68.68-69.66l.88-.03 1.16.03c37.87.51 68.68 31.76 68.68 69.66v84.8ZM688.3 387.7c0 34.18-25.09 62.88-57.8 68.56v-25.44c0-35.79-18.9-67.49-47.22-85.54 28.32-18.06 47.22-49.76 47.22-85.54v-25.47c14.08 2.41 27.08 9.02 37.39 19.31 10.28 10.31 16.99 23.27 19.41 37.52.67 3.89 1 7.86 1 11.8v84.8Z" data-name="Layer_1"/>
                </svg>
                <h1 className="text-2xl font-semibold mt-1 pl-4 text-black">BrainBox</h1>
        </div>

         <div className="relative ">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" viewBox="0 0 24 24">
            <path d="M8 7a4 4 0 1 0 8 0 4 4 0 0 0-8 0M6 21v-2a4 4 0 0 1 4-4h.5M18 22l3.35-3.284a2.143 2.143 0 0 0 .005-3.071 2.242 2.242 0 0 0-3.129-.006l-.224.22-.223-.22a2.242 2.242 0 0 0-3.128-.006 2.143 2.143 0 0 0-.006 3.071L18 22z" />
            </svg>
            <input
            ref={usernameRef}
            type="text"
            placeholder="Name / nickname"
            className="w-full pl-10 pr-4 py-2 bg-black border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-violet-600"
            />
        </div>

            <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg"  width="24" height="24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
                    strokeWidth="2" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" viewBox="0 0 24 24">
                    <path stroke="none" d="M0 0h24v24H0z"></path>
                    <path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"></path>
                    <path d="m3 7 9 6 9-6"></path>
                </svg>
                <input ref={emailRef} type="email" placeholder="Email"
                    className="w-full pl-10 pr-4 py-2 bg-black border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-violet-600"
                />
            </div>

            <div className="relative">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    viewBox="0 0 24 24"
                >
                <path stroke="none" d="M0 0h24v24H0z" />
                <path d="M5 13a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-6z" />
                <path d="M11 16a1 1 0 1 0 2 0 1 1 0 0 0-2 0M8 11V7a4 4 0 1 1 8 0v4" />
                </svg>

                <input
                    ref={passwordRef}
                    type="password"
                    placeholder="Password"
                    className="w-full pl-10 pr-4 py-2 bg-black border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-violet-600"
                />
            </div>
    <div className="relative">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            viewBox="0 0 24 24"
            >
            <path stroke="none" d="M0 0h24v24H0z" />
            <path d="M5 13a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-6z" />
            <path d="M11 16a1 1 0 1 0 2 0 1 1 0 0 0-2 0M8 11V7a4 4 0 1 1 8 0v4" />
        </svg>
        <input
            ref={confirmPasswordRef}
            type="password"
            placeholder="Confirm Password"
            className="w-full  pl-10 pr-4  bg-black border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-violet-600"
          />
        </div>


          <div className="flex items-center space-x-2">
            <input type="checkbox" id="terms" className="accent-violet-600" />
            <label htmlFor="terms" className="text-sm">
              I agree to the <a href="#" className="underline">terms and conditions</a>
            </label>
          </div>

          {errorMessage && (
            <div className="rounded-md border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {errorMessage}
            </div>
          )}
          <Button onClick={signup} text="Continue" variant="primary" size="md" fullWidth={true} loading={isSubmitting}/>
       

        <p className="text-sm text-center mt-6 text-gray-400">
          Already have an account? <Link to="/signin" className="underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
