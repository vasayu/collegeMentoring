import React from 'react'
import {Link} from "react-router-dom";

const footerlink:{value:string,href:string}[] = [
    {value:"Mentor",href:"/mentors"},
    {value:"Dashboard",href:"/dashboard"}
]

const Footer = () => {
    return (
        <footer className='bg-[#03173d] w-full h-20vh flex flex-col text-white p-12 gap-5'>
            <div className='grid grid-cols-2'>
                <div>
                    {/* <h1 className='text-2xl text-white'>Links</h1> */}
                    <ul className='list-none flex flex-col underline text-gray-300'>
                    </ul>
                </div>
                <div>
                    <h1 className='text-2xl text-white'>Contact:</h1>
                    <ul className='list-none text-gray-300'>
                        <li>Email: <span className='underline'>itsupport@jssaten.ac.in</span> </li>
                        <li>Phone no.: <span className='underline'>0120-2400115</span> </li>
                    </ul>
                </div>
            </div>
            <div className='items-center justify-center'>
                <span>© Copyright 2025. All Rights Reserved by JSS Mahavidyapeetha</span>
            </div>
        </footer>
    )
    }


export default Footer