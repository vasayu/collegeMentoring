// src/pages/Home.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiCLient, GET_USER_ROUTE } from "@/service/app";
import { useSelector } from "react-redux";

type UserType = {
    _id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: number | string;
    [k: string]: any;
};

const Home: React.FC = () => {
    const navigate = useNavigate();
    const [checking, setChecking] = useState(false);

    const userData = useSelector((state: any) => state.auth.userData) as UserType | null;
    let role: any;
    if (userData) {
        if (userData.studentId) {
            role = userData.studentId.role;
        } else if (userData.teacherId) {
            role = userData.teacherId.role;
        } else if (userData.adminId) {
            role = userData.adminId.role;
        }
    }

    const [user, setUser] = useState<UserType | null>(userData);

    useEffect(() => {
    }, []);

    const getDashboardRoute = () => {
        const role = Number(user?.role);
        if (role == 0) return `/student/${user?._id}`;
        if (role == 2 || role == 4) return "/admin";
        if (role == 1) return "/mentor";
        return "/signin";
    };

    if (checking) {
        return (
            <main className="flex items-center justify-center min-h-[80vh] bg-gradient-to-b from-gray-50 to-white px-6">
                <div className="text-center">
                    <div role="status" className="inline-flex items-center gap-3">
                        <svg
                            className="w-8 h-8 animate-spin"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            aria-hidden
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v8H4z"
                            />
                        </svg>
                        <span className="text-gray-600">Checking authentication...</span>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="flex items-center justify-center min-h-[80vh] bg-gradient-to-b from-gray-50 to-white px-6">
            <div className="text-center max-w-3xl">
                <p className="text-sm font-medium text-blue-600 mb-2">
                    Welcome to JSS Mentoring
                </p>

                <h1 className="text-5xl font-bold text-gray-900 mb-4 leading-tight">
                    Faculty-Student Mentoring System
                </h1>

                <p className="text-lg text-gray-600 mb-8">
                    A professional platform designed to connect students with mentors for
                    academic growth, career planning, and overall well-being.
                </p>

                {user ? (
                    <div className="flex items-center justify-center gap-4">
                        <button
                            onClick={() => navigate(getDashboardRoute())}
                            className="inline-block px-6 py-3 border-2 border-blue-600 text-blue-600 text-base font-medium rounded-lg transition-colors duration-300 ease-in-out hover:bg-blue-600 hover:text-white"
                        >
                            Dashboard
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => navigate("/signin")}
                        className="inline-block px-6 py-3 bg-blue-600 text-white text-base font-medium rounded-lg shadow hover:bg-blue-700 transition"
                    >
                        Get Started
                    </button>
                )}
            </div>
        </main>
    );
};

export default Home;
