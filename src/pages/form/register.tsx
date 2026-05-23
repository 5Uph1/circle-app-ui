import { Link } from "react-router-dom";
import { useRegisterManager } from "@/hooks/useAuth";

function Register () {
    const { handleChange, handleSubmit, form } = useRegisterManager();

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#121212]">
            <div className="w-[350px] bg-[#1e1e1e] p-8 rounded-xl shadow-lg text-white">
            
            {/* Logo */}
            <h1 className="text-green-500 text-2xl font-bold mb-2">
                waduh
            </h1>

            {/* Title */}
            <h2 className="text-lg mb-6">
                Register to <span className="text-green-500 font-bold">waduh</span>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Username */}
                <input
                type="text"
                name="username"
                placeholder="Username *"
                value={form.username}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-md bg-transparent border border-gray-700 focus:outline-none focus:border-green-500"
                />

                {/* Fullname */}
                <input
                type="text"
                name="fullname"
                placeholder="Fullname *"
                value={form.fullname}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-md bg-transparent border border-gray-700 focus:outline-none focus:border-green-500"
                />

                {/* Email */}
                <input
                type="text"
                name="email"
                placeholder="Email *"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-md bg-transparent border border-gray-700 focus:outline-none focus:border-green-500"
                />

                {/* Password */}
                <input
                type="password"
                name="password"
                placeholder="Password *"
                value={form.password}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-md bg-transparent border border-gray-700 focus:outline-none focus:border-green-500"
                />

                {/* Button */}
                <button
                type="submit"
                className="w-full py-3 bg-green-500 hover:bg-green-600 rounded-full font-semibold transition cursor-pointer"
                >
                Register
                </button>
            </form>

            {/* Register */}
            <p className="mt-4 text-xs text-gray-400 text-center">
                Already have an account?{" "}
                <Link to="/login">
                <span className="text-green-500 cursor-pointer font-bold hover:underline">
                Log in
                </span>
                </Link>
            </p>

            </div>
        </div>
    );
}

export default Register