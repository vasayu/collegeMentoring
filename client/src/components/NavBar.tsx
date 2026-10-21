// src/components/NavBar.tsx
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    apiCLient,
    LOGOUT_ROUTE,
} from "@/service/app";

import { useDispatch, useSelector } from "react-redux";
import { logout as logoutAction } from "@/store/authSlice";
import { Menu, X } from "lucide-react";
import toast from "react-hot-toast";

type UserType = {
    _id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: number | string;
    adminId?: any;
    teacherId?: any;
    studentId?: any;
    [k: string]: any;
};

const NavBar: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname.split("/")[2];
    const userFromStore = useSelector((s: any) => (s as any).auth?.userData) as UserType;
    const [menuOpen, setMenuOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<UserType | null>(userFromStore);
    
    let navLinks;
    if (userFromStore?.adminId) {
        navLinks = [
            { path: "/admin/", label: "Home" },
            { path: "/admin/classes", label: "Classes" },
            { path: "/admin/settings", label: "Settings" },
        ];    
    } else if (userFromStore?.teacherId) {
        navLinks = [
            { path: "/mentor", label: "Dashboard" },
            { path: "/create-student", label: "Create Student" },
            { path: "/mentor/settings", label: "Settings" },
        ];  
    } else if (userFromStore?.studentId) {
        navLinks = [
            { path: `/student/${userFromStore?.studentId?._id || userFromStore?._id}`, label: "Dashboard" },
            { path: "/student/settings", label: "Settings" },
        ];   

    } else if (userFromStore?.counselorId) {
        navLinks = [
            {path: "/counselor", label: "Dashboard" },
        ];
    }else{
        navLinks = [
            {path: "/signin",label:"Sign In"}
        ]
    }
    const logoutHandler = async () => {
        try {
            await apiCLient.post(LOGOUT_ROUTE, {}, { withCredentials: true });
        } catch (err) {
            console.warn("Logout API error:", err);
        } finally {
            dispatch(logoutAction());
            setCurrentUser(null);
            localStorage.removeItem("userData");
            toast.success("Logged out successfully");
            navigate("/signin");
        }
    };

    return (
        <nav className="h-[10vh] w-full bg-white shadow-sm px-6 flex items-center justify-between relative">
            <Link to="/" className="flex items-center gap-2">
                <img
                    src="/logo.jpg"
                    alt="Logo"
                    className="h-10 hidden md:flex w-auto object-contain cursor-pointer"
                />
            </Link>

            <h1 className="absolute left-1/4 -translate-x-1/2 md:left-1/2 font-semibold text-lg md:text-xl text-[#0054A4]">
                JSS Mentoring
            </h1>

            <div className="hidden md:flex gap-4">
                {navLinks.map((link) => (
                    <Link
                        key={link.path}
                        to={link.path}
                        className={`px-3 py-2 cursor-pointer rounded-lg ${currentPath === link.path.replace("/admin/", "")
                            ? "bg-blue-600 text-white"
                            : "hover:bg-gray-100"
                            }`}
                    >
                        {link.label}
                    </Link>
                ))}
                {userFromStore && <button className={`px-3 py-2 rounded-lg hover:bg-gray-100`} onClick={logoutHandler}>Logout</button>}
            </div>

            <button
                className="md:hidden text-gray-700"
                onClick={() => setMenuOpen(!menuOpen)}
            >
                {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {menuOpen && (
                <div className="absolute top-[10vh] left-0 w-full bg-white shadow-md flex flex-col items-center px-6 py-4 space-y-2 md:hidden z-50">
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            onClick={() => setMenuOpen(false)}
                            className={`w-full px-3 py-2 text-center rounded-lg ${currentPath === link.path.replace("/", "")
                                ? "bg-blue-600 text-white"
                                : "hover:bg-gray-100"
                                }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                    {userFromStore && <button className={`w-full px-3 py-2 rounded-lg hover:bg-gray-100`} onClick={logoutHandler}>Logout</button> }
                </div>
            )}
        </nav>
    );
};

export default NavBar;
