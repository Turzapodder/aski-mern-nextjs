'use client'
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

const Navbar = () => {
  const [isAuth, setIsAuth] = useState<any>(null);
  
  useEffect(() => {
    const authCookie = Cookies.get('is_auth')
    setIsAuth(authCookie)
  }, [])
  
  return (
    <>
      <nav className="bg-white shadow-sm border-b border-gray-100">
        <div className="w-full mx-auto px-4" style={{maxWidth: '1920px'}}>
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold">
                <span className="text-gray-900">As</span>
                <span className="text-blue-600">Ki</span>
              </Link>
            </div>
            
            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/features" className="text-gray-700 hover:text-gray-900 font-medium">
                Features
              </Link>
              
              <Link href="/communities" className="text-gray-700 hover:text-gray-900 font-medium">
                About Us
              </Link>
              
              <Link href="/events" className="text-gray-700 hover:text-gray-900 font-medium">
                Contact
              </Link>
              
              <Link href="/about" className="text-gray-700 hover:text-gray-900 font-medium">
                About Us
              </Link>
              
              <Link href="/account/login" className="text-gray-700 hover:text-gray-900 font-medium">
                Login
              </Link>
            </div>
            
            {/* Join Button */}
            <div className="flex items-center space-x-4">
              <Link href="/account/register" className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                Join for Free →
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}

export default Navbar