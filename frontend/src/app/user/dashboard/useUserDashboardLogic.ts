import { useEffect, useState } from 'react'
import { useGetUserQuery } from '@/lib/services/auth'
import { useConvertFormToAssignmentMutation } from '@/lib/services/student'

const mockUser = {
  name: 'Taylor',
  avatar: '/site-logo.png' // Using available logo as placeholder
};

export const useUserDashboardLogic = () => {
  const { data: userData, isSuccess: isUserSuccess } = useGetUserQuery();
  const [user, setUser] = useState(mockUser);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<any>(null);
  const [convertForm] = useConvertFormToAssignmentMutation();

  useEffect(() => {
    if (isUserSuccess && userData?.user) {
      setUser({ name: userData.user.name || 'Taylor', avatar: userData.user.avatar || '/site-logo.png' });

      // Check for pending form data after login
      const storedSessionId = localStorage.getItem('pendingFormSessionId');
      console.log('Checking for stored session ID:', storedSessionId);

      if (storedSessionId) {
        console.log('Found stored session ID, converting form...');
        // Convert the form data
        convertForm({ sessionId: storedSessionId })
          .unwrap()
          .then((response) => {
            console.log('Convert form response:', response);
            if (response.formData) {
              setPendingFormData(response.formData);
              // Automatically show the modal with pre-filled data
              setShowPostModal(true);
              console.log('Form data converted and modal opened:', response.formData);
            }
            localStorage.removeItem('pendingFormSessionId');
            console.log('Session ID removed from localStorage');
          })
          .catch((error) => {
            console.error('Failed to convert form:', error);
            localStorage.removeItem('pendingFormSessionId');
          });
      } else {
        console.log('No stored session ID found');
      }
    }
  }, [userData, isUserSuccess, convertForm]);


  // Calendar state and functions
  const [currentMonth, setCurrentMonth] = useState(new Date()); 
  
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  return {
    user,
    userData,
    isProfileDropdownOpen,
    setIsProfileDropdownOpen,
    showPostModal,
    setShowPostModal,
    pendingFormData,
    setPendingFormData,
    currentMonth,
    prevMonth,
    nextMonth
  }
}
