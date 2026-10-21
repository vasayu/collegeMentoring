// src/pages/Signin.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiCLient, LOGIN_ROUTE } from "@/service/app";
import { login as authLogin } from "@/store/authSlice";
import { useDispatch, useSelector } from "react-redux";

/**
 * Simple Signin page.
 * - After successful login, redirects:
 *    teacherId -> /mentees
 *    adminId   -> /admin
 *    otherwise -> /dashboard
 *
 * NOTE: This expects your auth.login(...) to either:
 *  - return a user object that includes `teacherId` / `adminId`, OR
 *  - populate `auth.user` after login.
 *
 * I have only changed the if/else routing logic as requested.
 */

type SigninForm = {
    email: string;
    password: string;
};

type UserType = {
    _id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: number | string;
    [k: string]: any;
};

const Signin: React.FC = () => {
    const dispatch = useDispatch();
    const [ formData, setFormData ] = useState<SigninForm>( {
        email: "",
        password: "",
    } );
    const navigate = useNavigate();
    const userData = useSelector((state: any) => state.auth.userData) as UserType | null;
    // let role: any;
    // if (userData) {
    //     if (userData.studentId) {
    //         role = userData.studentId.role;
    //         navigate(`/student/${userData.studentId._id}`)
    //     } else if (userData.teacherId) {
    //         role = userData.teacherId.role;
    //         navigate(`/mentor`)
    //     } else if (userData.adminId) {
    //         role = userData.adminId.role;
    //         navigate(`/admin`)
    //     } else if (userData.counselorId) {
    //         role = userData.counselorId.role;
    //         navigate(`/counselor`)
    //     }
    // }
    // console.log(userData);
    const [ error, setError ] = useState<string | null>( null );
    const [ submitting, setSubmitting ] = useState( false );
    const [ showPassword, setShowPassword ] = useState( false );
    const [ rememberMe, setRememberMe ] = useState<boolean>( false );

    const auth = useAuth();

    // Restore remembered email (if any)
    useEffect( () => {
        const remembered = localStorage.getItem( "rememberedEmail" );
        if ( remembered ) {
            setFormData( ( s ) => ( { ...s, email: remembered } ) );
            setRememberMe( true );
        }
    }, [] );

    // Update form state for inputs
    const handleChange = ( e: React.ChangeEvent<HTMLInputElement> ) => {
        const { name, value } = e.target;
        setFormData( ( s ) => ( { ...s, [ name ]: value } ) );
    };

    // Basic client-side validation
    const validate = () => {
        if ( !formData.email.trim() ) {
            setError( "Email is required" );
            return false;
        }
        if ( !formData.password ) {
            setError( "Password is required" );
            return false;
        }
        return true;
    };

    // Simple helper to get the user's role after login.
    // Tries loginResult.role first, then falls back to auth.user.role.

    const handleSubmit = async ( e: React.FormEvent ) => {
        e.preventDefault();
        setError(null);
    
        const trimmedData = {
            email: formData.email.trim().toLowerCase(),
            password: formData.password, 
        };
    
        if (!trimmedData.email) {
            setError("Email is required");
            return;
        }
        if (!trimmedData.password) {
            setError("Password is required");
            return;
        }
    
        if (rememberMe) {
            localStorage.setItem("rememberedEmail", trimmedData.email);
        }
    
        setSubmitting(true);
        try {
            const loginResult = await apiCLient.post( LOGIN_ROUTE, trimmedData );
            // console.log( "host url ", import.meta.env.VITE_HOST_URL )
            const userData = loginResult.data.data.user;
            if ( loginResult.status === 200 ) {
                dispatch( authLogin( userData ) );
            }
            // Remember email if checkbox checked

            // ---------- CHANGED BLOCK: check IDs instead of role ----------
            // Prefer userData from login response, fallback to auth.user
            const currentUser =
                ( userData && typeof userData === "object" ? userData : null ) ||
                ( auth && ( auth as any ).user ? ( auth as any ).user : null );

            if ( currentUser ) {
                // If teacherId exists and is truthy -> mentees
                if ( "teacherId" in currentUser && currentUser.teacherId ) {
                    navigate( "/mentor", { replace: true } );
                    return;
                }
                // If adminId exists and is truthy -> admin
                if ( "adminId" in currentUser && currentUser.adminId ) {
                    navigate( "/admin", { replace: true } );
                    return;
                }
                // Counselor
                if ( currentUser.counselorId && currentUser.counselorId.role === 3 ) {
                    navigate( "/counselor", { replace: true } );
                    return;
                }
                // Student (default)
                navigate( `/student/${ currentUser.studentId._id }`, { replace: true } );
                return;

            }
            // If we couldn't determine user or IDs, fall back to dashboard
            navigate( "/dashboard", { replace: true } );
        } catch ( err: any ) {
            // Normalize and show error
            const msg =
                typeof err === "string"
                    ? err
                    : err?.response.data.message ?? "Login failed. Check credentials.";
            setError( msg );
        } finally {
            setSubmitting( false );
        }
    };

    return (
        <div className="min-h-[calc(100vh-12vh-20vh)] flex items-center justify-center bg-gray-50 px-4">
            <form
                onSubmit={ handleSubmit }
                className="w-full max-w-md bg-white p-8 shadow-lg rounded-2xl space-y-6"
                aria-describedby={ error ? "signin-error" : undefined }
            >
                <h1 className="text-3xl font-bold text-center text-gray-800">
                    Sign In
                </h1>

                { error && (
                    <div
                        id="signin-error"
                        role="alert"
                        className="bg-red-50 text-red-700 border border-red-100 p-3 rounded-md text-sm"
                    >
                        { error }
                    </div>
                ) }

                <div className="flex flex-col space-y-2">
                    <label htmlFor="email" className="text-gray-700 font-medium">
                        Email or Username
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="text"
                        autoComplete="username"
                        required
                        placeholder="Enter your email or username"
                        value={ formData.email }
                        onChange={ handleChange }
                        className="border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        disabled={ submitting }
                    />
                </div>

                <div className="flex flex-col space-y-2 relative">
                    <label htmlFor="password" className="text-gray-700 font-medium">
                        Password
                    </label>
                    <input
                        id="password"
                        name="password"
                        type={ showPassword ? "text" : "password" }
                        autoComplete="current-password"
                        required
                        placeholder="Enter your password"
                        value={ formData.password }
                        onChange={ handleChange }
                        className="border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none pr-10"
                        disabled={ submitting }
                    />
                    <button
                        type="button"
                        onClick={ () => setShowPassword( ( s ) => !s ) }
                        aria-label={ showPassword ? "Hide password" : "Show password" }
                        className="absolute right-3 top-[45px] text-sm text-gray-500"
                        tabIndex={ 0 }
                    >
                        { showPassword ? "Hide" : "Show" }
                    </button>
                </div>

                <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 text-gray-600">
                        <input
                            type="checkbox"
                            checked={ rememberMe }
                            onChange={ ( e ) => setRememberMe( e.target.checked ) }
                            className="w-4 h-4"
                            disabled={ submitting }
                        />
                        Remember me
                    </label>

                    <Link to="/reset-password" className="text-blue-600 hover:underline">
                        Forgot password?
                    </Link>
                </div>

                <button
                    type="submit"
                    disabled={ submitting }
                    className={ `w-full px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md transition ${ submitting ? "opacity-60 cursor-not-allowed" : "hover:bg-blue-700"
                        }` }
                >
                    { submitting ? "Signing in..." : "Sign In" }
                </button>
            </form>
        </div>
    );
};

export default Signin;
