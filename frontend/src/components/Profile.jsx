import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { FaUserCircle, FaEnvelope, FaUserTag, FaIdBadge, FaEdit, FaSave, FaTimes, FaPhone, FaVenusMars, FaCamera } from 'react-icons/fa';
// import { getProfile, updateProfile } from '../utils/api'; // Assuming you have these
import { useNavigate } from 'react-router-dom';

// --- MOCK API FUNCTIONS FOR DEMONSTRATION ---
// In your real app, you would remove these and use your actual API calls.
const getProfile = async (userId) => {
    console.log(`MOCK GET: Fetching profile for ${userId}`);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    return {
        _id: '12345',
        firstName: 'Alex',
        lastName: 'Doe',
        email: 'alex.doe@example.com',
        username: 'alexdoe',
        phoneNumber: '123-456-7890',
        gender: 'Male',
        avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
    };
};

const updateProfile = async (userId, formData) => {
    console.log(`MOCK UPDATE: Updating profile for ${userId}`);
    // Log FormData contents
    for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
    }
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
    // Return a new object that includes the updated avatar URL if one was uploaded
    const updatedData = {};
    for (let [key, value] of formData.entries()) {
        if (key !== 'avatar') {
            updatedData[key] = value;
        }
    }
    // If an avatar was part of the form data, simulate a new URL for it
    if (formData.has('avatar')) {
        updatedData.avatar = URL.createObjectURL(formData.get('avatar'));
    }
    return updatedData;
};
// --- END OF MOCK API FUNCTIONS ---


const getUserId = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?._id || user?.id || user?.email || '12345'; // Fallback for demo
  } catch (err) {
    console.error('Error parsing user from localStorage:', err);
    return '12345'; // Fallback for demo
  }
};

const Profile = () => {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', username: '', phoneNumber: '', gender: '' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const userId = getUserId();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!userId) {
      setError('No user ID found. Please log in again.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    getProfile(userId)
      .then(data => {
        if (!data) {
          throw new Error('No profile data returned from API.');
        }
        setUser(data);
        setForm({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          username: data.username || '',
          phoneNumber: data.phoneNumber || '',
          gender: data.gender || '',
        });
        setAvatarPreview(data.avatar || '');
        setLoading(false);
      })
      .catch(err => {
        console.error('Profile API error:', err);
        setError('Failed to load profile. Please try again later.');
        setLoading(false);
      });
  }, [userId]);

  const handleEdit = () => {
    // Reset form and avatar preview to current user state when opening modal
    setForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        username: user.username || '',
        phoneNumber: user.phoneNumber || '',
        gender: user.gender || '',
    });
    setAvatarPreview(user.avatar || '');
    setAvatarFile(null);
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditMode(false);
    // Clean up preview URL
    if (avatarFile) {
        URL.revokeObjectURL(avatarPreview);
    }
  };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');

    // Use FormData to handle file uploads
    const formData = new FormData();
    Object.keys(form).forEach(key => {
        formData.append(key, form[key]);
    });
    if (avatarFile) {
        formData.append('avatar', avatarFile);
    }

    try {
      const updated = await updateProfile(userId, formData);
      // Create a new user object with updated fields
      const updatedUser = { ...user, ...form };
      if (updated.avatar) {
          updatedUser.avatar = updated.avatar;
      }
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setEditMode(false);
    } catch (err) {
      setError('Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <ProfileContainer><Loader /></ProfileContainer>;
  }

  if (error && !editMode) {
    return <ProfileContainer><ErrorCard>{error}</ErrorCard></ProfileContainer>;
  }

  if (!user) {
    return <ProfileContainer><ErrorCard>Could not load user profile.</ErrorCard></ProfileContainer>;
  }

  return (
    <ProfileContainer>
      <ProfileCard>
        <AvatarContainer>
            <Avatar src={user?.avatar || 'https://placehold.co/150x150/E0F7FA/01579B?text=User'} alt="Avatar" />
            <AvatarOverlay onClick={() => setEditMode(true)}>
                <FaCamera />
            </AvatarOverlay>
        </AvatarContainer>
        <UserName>{`${user.firstName} ${user.lastName}`}</UserName>
        <UserHandle>@{user.username || 'username'}</UserHandle>
        
        <ProfileInfo>
          <InfoRow><IconWrapper><FaUserTag /></IconWrapper><div><InfoLabel>Username</InfoLabel><InfoValue>{user.username || '-'}</InfoValue></div></InfoRow>
          <InfoRow><IconWrapper><FaIdBadge /></IconWrapper><div><InfoLabel>Full Name</InfoLabel><InfoValue>{`${user.firstName || ''} ${user.lastName || ''}`.trim() || '-'}</InfoValue></div></InfoRow>
          <InfoRow><IconWrapper><FaEnvelope /></IconWrapper><div><InfoLabel>Email</InfoLabel><InfoValue>{user.email || '-'}</InfoValue></div></InfoRow>
          <InfoRow><IconWrapper><FaPhone /></IconWrapper><div><InfoLabel>Phone</InfoLabel><InfoValue>{user.phoneNumber || '-'}</InfoValue></div></InfoRow>
          <InfoRow><IconWrapper><FaVenusMars /></IconWrapper><div><InfoLabel>Gender</InfoLabel><InfoValue>{user.gender || '-'}</InfoValue></div></InfoRow>
        </ProfileInfo>
        
        <ButtonGroup>
          <EditButton onClick={handleEdit}><FaEdit /> Edit Profile</EditButton>
          <LogoutButton onClick={() => { localStorage.removeItem('user'); navigate('/'); }}>
             Logout
          </LogoutButton>
        </ButtonGroup>
      </ProfileCard>

      {editMode && (
        <ModalOverlay>
            <EditModal>
                <ModalTitle>Edit Profile</ModalTitle>
                {error && <ErrorText>{error}</ErrorText>}
                <ModalForm>
                    <AvatarUploadContainer>
                        <img src={avatarPreview || 'https://placehold.co/150x150/E0F7FA/01579B?text=User'} alt="Avatar Preview" className="preview-avatar" />
                        <UploadButton onClick={() => fileInputRef.current.click()}>
                            <FaCamera /> Change Photo
                        </UploadButton>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            style={{ display: 'none' }}
                        />
                    </AvatarUploadContainer>
                    <ModalInput name="firstName" value={form.firstName} onChange={handleChange} placeholder="First Name" />
                    <ModalInput name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last Name" />
                    <ModalInput name="email" value={form.email} onChange={handleChange} placeholder="Email" />
                    <ModalInput name="username" value={form.username} onChange={handleChange} placeholder="Username" />
                    <ModalInput name="phoneNumber" value={form.phoneNumber} onChange={handleChange} placeholder="Phone Number" />
                    <ModalSelect name="gender" value={form.gender} onChange={handleChange}>
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </ModalSelect>
                </ModalForm>
                <ModalActions>
                    <SaveButton onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <SmallLoader/> : <><FaSave /> Save</>}
                    </SaveButton>
                    <CancelButton onClick={handleCancel}><FaTimes /> Cancel</CancelButton>
                </ModalActions>
            </EditModal>
        </ModalOverlay>
      )}
    </ProfileContainer>
  );
};

// --- Styled Components (Blue & White Theme) ---

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
`;

const ProfileContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #e0f7fa 0%, #b3e5fc 100%);
  padding: 20px;
  font-family: 'Inter', sans-serif;
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap');
`;

const ProfileCard = styled.div`
  background: #ffffff;
  padding: 40px;
  border-radius: 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 420px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #01579b;
  animation: ${fadeIn} 0.5s ease-out;
  border: 1px solid #e0e0e0;
`;

const AvatarContainer = styled.div`
    position: relative;
    margin-bottom: 20px;
    cursor: pointer;
`;

const Avatar = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid #0288d1;
  box-shadow: 0 4px 15px rgba(2, 136, 209, 0.2);
  transition: filter 0.3s ease;
`;

const AvatarOverlay = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.4);
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.5rem;
    opacity: 0;
    transition: opacity 0.3s ease;
    
    ${AvatarContainer}:hover & {
        opacity: 1;
    }
`;

const UserName = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  color: #01579b;
`;

const UserHandle = styled.p`
  font-size: 1rem;
  color: #0288d1;
  margin-top: 4px;
  margin-bottom: 24px;
`;

const ProfileInfo = styled.div`
  width: 100%;
  text-align: left;
  margin-bottom: 30px;
  border-top: 1px solid #e0e0e0;
  padding-top: 20px;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  font-size: 0.95rem;
  &:last-child { margin-bottom: 0; }
`;

const IconWrapper = styled.div`
  color: #0288d1;
  font-size: 1.2rem;
  margin-right: 15px;
  width: 25px;
  text-align: center;
`;

const InfoLabel = styled.span`
  display: block;
  color: #546e7a;
  font-size: 0.8rem;
  margin-bottom: 2px;
`;

const InfoValue = styled.span`
  display: block;
  color: #01579b;
  font-weight: 500;
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 15px;
    width: 100%;
`;

const baseButton = `
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
`;

const EditButton = styled.button`
  ${baseButton}
  background-color: #0288d1;
  color: #ffffff;
  &:hover {
    background-color: #01579b;
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(2, 136, 209, 0.3);
  }
`;

const LogoutButton = styled.button`
  ${baseButton}
  background-color: transparent;
  color: #d32f2f;
  border: 1px solid #d32f2f;
  &:hover {
    background-color: #d32f2f;
    color: #fff;
  }
`;

// --- Modal Styles ---

const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(5px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    animation: ${fadeIn} 0.3s ease;
`;

const EditModal = styled.div`
  background: #ffffff;
  padding: 30px;
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 450px;
  animation: ${fadeIn} 0.4s ease-out;
`;

const ModalTitle = styled.h2`
  text-align: center;
  color: #01579b;
  margin-top: 0;
  margin-bottom: 25px;
`;

const ModalForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const AvatarUploadContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
    margin-bottom: 15px;
    padding: 20px;
    background-color: #f8f9fa;
    border-radius: 12px;

    .preview-avatar {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        object-fit: cover;
        border: 3px solid #e0e0e0;
    }
`;

const UploadButton = styled.button`
    ${baseButton}
    width: auto;
    padding: 8px 16px;
    font-size: 0.9rem;
    background-color: #546e7a;
    color: white;
    &:hover {
        background-color: #37474f;
    }
`;

const baseInput = `
  width: 100%;
  padding: 12px 15px;
  border-radius: 8px;
  border: 1px solid #cfd8dc;
  background-color: #f8f9fa;
  color: #01579b;
  font-size: 1rem;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  
  &::placeholder { color: #90a4ae; }
  &:focus {
      outline: none;
      border-color: #0288d1;
      box-shadow: 0 0 0 3px rgba(2, 136, 209, 0.2);
  }
`;

const ModalInput = styled.input` ${baseInput} `;
const ModalSelect = styled.select` ${baseInput} appearance: none; `;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
`;

const SaveButton = styled.button`
  ${baseButton}
  width: auto;
  min-width: 120px;
  background-color: #2e7d32;
  color: #ffffff;
  &:hover { background-color: #1b5e20; }
  &:disabled { background-color: #9e9e9e; cursor: not-allowed; }
`;

const CancelButton = styled.button`
  ${baseButton}
  width: auto;
  min-width: 120px;
  background-color: #d32f2f;
  color: #ffffff;
  &:hover { background-color: #c62828; }
`;

// --- Loader and Error Styles ---

const spin = keyframes` to { transform: rotate(360deg); } `;

const Loader = styled.div`
  border: 5px solid rgba(2, 136, 209, 0.2);
  border-top: 5px solid #0288d1;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: ${spin} 1s linear infinite;
`;

const SmallLoader = styled(Loader)`
    width: 20px;
    height: 20px;
    border-width: 3px;
    border-top-color: #ffffff;
    border-left-color: rgba(255,255,255,0.3);
    border-bottom-color: rgba(255,255,255,0.3);
    border-right-color: rgba(255,255,255,0.3);
`;

const ErrorCard = styled(ProfileCard)`
  border-color: #d32f2f;
  color: #d32f2f;
`;

const ErrorText = styled.p`
    color: #d32f2f;
    text-align: center;
    margin: -10px 0 15px 0;
    font-size: 0.9rem;
`;

export default Profile;
