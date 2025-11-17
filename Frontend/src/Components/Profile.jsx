import React from 'react';
import { useAuth } from "../Context/AuthContext";
import "./Profile.css";
import { useState } from 'react';
import { updateUserProfile } from '../services/APISevice';
import LogoutConfirmModal from './LogoutConfirmModal';

function Profile() {
    const { logout, user, setUser } = useAuth();
    const [editable, setEditable] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [formData, setFormData] = useState({
        username: user?.username || '',
        email: user?.email || ''
    });
    const [originalData, setOriginalData] = useState({
        username: user?.username || '',
        email: user?.email || ''
    });

    // Update formData when user changes
    React.useEffect(() => {
        if (user) {
            const userData = {
                username: user.username || '',
                email: user.email || ''
            };
            setFormData(userData);
            setOriginalData(userData);
        }
    }, [user]);

    // Check if data has changed
    const hasChanges = () => {
        return formData.username !== originalData.username ||
            formData.email !== originalData.email;
    };

    // Format the createdAt date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error/success messages when user types
        setError('');
        setSuccess('');
    };

    const onEditClick = async (event) => {
        event.preventDefault();

        if (!editable) {
            // Enable editing mode
            setEditable(true);
            setError('');
            setSuccess('');
        } else {
            // Save the changes
            try {
                setLoading(true);
                setError('');
                setSuccess('');

                const response = await updateUserProfile(formData);

                // Update local storage and context with new user data
                const updatedUser = { ...user, ...formData };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setUser(updatedUser);

                // Update original data to reflect saved changes
                setOriginalData(formData);

                setSuccess(response.message || 'Profile updated successfully!');
                setEditable(false);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to update profile');
                console.error('Update error:', err);
            } finally {
                setLoading(false);
            }
        }
    }

    const onCancelEdit = () => {
        // Reset form data to original values
        setFormData(originalData);
        setEditable(false);
        setError('');
        setSuccess('');
    };


    const OnLogoutClicked = (event) => {
        event.preventDefault();
        setShowLogoutModal(true);
    }

    const confirmLogout = () => {
        setShowLogoutModal(false);
        logout();
    }

    return (
        <>
            <div className="profile">
                <h1>Profile</h1>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <div className="profile-details">
                    <p><strong>UserName:</strong> <input className={editable ? "EditableInputs green " : "EditableInputs black"} type="text" name="username" value={formData.username} onChange={handleInputChange} readOnly={!editable} /></p>
                    <p><strong>Email:</strong> <input className={editable ? "EditableInputs green " : "EditableInputs black"} type="email" name="email" value={formData.email} onChange={handleInputChange} readOnly={!editable} /></p>
                    <p><strong>Account Created:</strong> {formatDate(user?.createdAt)} </p>
                    {console.log('User data:', user)}
                    {console.log('CreatedAt:', user?.createdAt)}
                    {/* Add more user details as needed */}
                </div>
                <div className="buttons">
                    <button
                        className={!editable ? "edit-button" : "edit-button savebtn"}
                        onClick={onEditClick}
                        disabled={loading || (editable && !hasChanges())}
                    >
                        {loading ? 'Saving...' : (editable ? 'Save' : 'Edit')}
                    </button>
                    {editable && (
                        <button
                            className="cancel-button"
                            onClick={onCancelEdit}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                    )}
                    <button className="logout-button " onClick={OnLogoutClicked}>Logout</button>
                </div>
            </div>

            {/* Logout Confirmation Modal */}
            <LogoutConfirmModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={confirmLogout}
            />
        </>
    );
}
export default Profile;