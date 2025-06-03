import { useState, useEffect } from 'react';
import { Storage, Auth } from 'aws-amplify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const [nickname, setNickname] = useState('');
  const [major, setMajor] = useState('');
  const [skills, setSkills] = useState([]);
  const [selfIntro, setSelfIntro] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  const skillCategories = {
    'Programming': ['Python', 'Java', 'C++', 'Go', 'JavaScript', 'TypeScript', 'R'],
    'Frontend': ['React', 'Vue', 'Next.js', 'HTML/CSS', 'Bootstrap', 'Tailwind CSS'],
    'Backend': ['Node.js', 'Express.js', 'Flask', 'Django', 'Spring Boot'],
    'Data & AI': ['SQL', 'NoSQL', 'Pandas', 'NumPy', 'Scikit-learn', 'TensorFlow', 'PyTorch', 'OpenCV', 'Hugging Face', 'LLM Apps'],
    'Cloud & Tools': ['AWS', 'GCP', 'Firebase', 'Docker', 'Git', 'CI/CD'],
    'Design & UX': ['Design', 'UI/UX', 'Figma', 'User Research', 'Prototyping'],
    'Business & Product': ['Marketing', 'Business Analysis', 'Project Management', 'Product Thinking', 'User-Centered Design'],
    'Soft Skills': ['Presentation', 'Communication', 'Teamwork', 'Logical Thinking', 'Problem Solving', 'Time Management', 'Creative Thinking', 'Agile Development']
  };

  const [expandedCategories, setExpandedCategories] = useState({});

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const user = await Auth.currentAuthenticatedUser();
        const nickname = user.attributes.nickname || '';
        setNickname(nickname);
      } catch (err) {
        console.error('Failed to get user info', err);
      }
    };
    fetchUserInfo();
  }, []);

  const toggleCategory = (category) => {
    setExpandedCategories((prev) => ({ 
      ...prev, 
      [category]: !prev[category] 
    }));
  };

  const handleCheckboxChange = (skill) => {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file?.type === 'application/pdf') {
      setResumeFile(file);
      setMessage('');
    } else {
      alert('Please upload a PDF resume');
      setResumeFile(null);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!nickname.trim()) {
      newErrors.nickname = 'Nickname is required';
    }
    
    if (!major.trim()) {
      newErrors.major = 'Major is required';
    }
    
    if (skills.length === 0) {
      newErrors.skills = 'Please select at least one skill';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    
    if (!validateForm()) {
      setMessage('❌ Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    
    try {
      const user = await Auth.currentAuthenticatedUser();
      const userId = user.attributes.sub;
      const session = await Auth.currentSession();
      const idToken = session.getIdToken().getJwtToken();

      let resumeUrl = '';
      let resumeFilename = '';

      if (resumeFile) {
        setUploading(true);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        resumeFilename = `${userId}/resume_${timestamp}.pdf`;
        await Storage.put(resumeFilename, resumeFile, {
          contentType: 'application/pdf',
          level: 'public'
        });
        resumeUrl = await Storage.get(resumeFilename, { level: 'public' });
        setUploading(false);
      }

      const payload = {
        userId,
        nickname,
        major,
        skills,
        selfIntro,
        resumeUrl
      };

      const API_URL = 'https://7rkf202nmj.execute-api.ap-southeast-2.amazonaws.com/prod/create-profile';

      await axios.post(API_URL, payload, {
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        }
      });

      setMessage('✅ Profile saved successfully!');

      setTimeout(() => {
        navigate('/competitions');
      }, 1500);
    } catch (err) {
      console.error(err);
      setMessage('❌ Save failed: ' + (err?.response?.data?.error || err.message));
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #eff6ff 0%, #f3e8ff 50%, #fdf2f8 100%)',
      position: 'relative'
    }}>
      {/* Background decorations */}
      <div style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none'
      }}>
        <div style={{
          position: 'absolute',
          top: '15%',
          right: '12%',
          width: '140px',
          height: '140px',
          background: 'rgba(147, 197, 253, 0.2)',
          borderRadius: '50%',
          filter: 'blur(60px)'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '25%',
          left: '8%',
          width: '180px',
          height: '180px',
          background: 'rgba(196, 181, 253, 0.15)',
          borderRadius: '50%',
          filter: 'blur(60px)'
        }}></div>
        <div style={{
          position: 'absolute',
          top: '45%',
          left: '75%',
          width: '110px',
          height: '110px',
          background: 'rgba(251, 207, 232, 0.25)',
          borderRadius: '50%',
          filter: 'blur(40px)'
        }}></div>
      </div>

      {/* Top navigation bar */}
      <div style={{
        position: 'relative',
        zIndex: 20,
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* Logo section */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
              borderRadius: '12px',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '20px' }}>👤</span>
            </div>
            <div>
              <h1 style={{
                fontSize: '18px',
                fontWeight: '700',
                color: '#1f2937',
                margin: 0,
                background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                User Profile
              </h1>
              <p style={{
                fontSize: '12px',
                color: '#6b7280',
                margin: 0
              }}>
                Profile Setup
              </p>
            </div>
          </div>

          {/* Navigation buttons */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            {/* Competitions button */}
            <button
              onClick={() => navigate('/competitions')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255, 255, 255, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '10px',
                padding: '8px 12px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.7)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span>🏆</span>
              <span className="hidden-mobile">Competitions</span>
            </button>

            {/* Invitations button */}
            <button
              onClick={() => navigate('/invites')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                border: 'none',
                borderRadius: '10px',
                padding: '8px 12px',
                fontSize: '14px',
                fontWeight: '600',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(90deg, #2563eb, #7c3aed)';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(90deg, #3b82f6, #8b5cf6)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span>📬</span>
              <span className="hidden-mobile">Invitations</span>
            </button>

            {/* Logout button */}
            <button
              onClick={() => {
                // Add logout logic here
                console.log('Logout');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '10px',
                padding: '8px 12px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#dc2626',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span>🚪</span>
              <span className="hidden-mobile">Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div style={{
        position: 'relative',
        zIndex: 10,
        maxWidth: '800px',
        margin: '0 auto',
        padding: '24px'
      }}>
        {/* Page title */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '32px',
          paddingTop: '16px'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(8px)',
            borderRadius: '20px',
            padding: '8px 16px',
            marginBottom: '16px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <span style={{ fontSize: '16px' }}>✨</span>
            <span style={{ 
              fontSize: '14px', 
              fontWeight: '500', 
              color: '#374151' 
            }}>
              Profile Setup
            </span>
          </div>
          
          <h2 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            marginBottom: '8px',
            background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Edit Profile
          </h2>
          <p style={{ 
            color: '#6b7280', 
            fontSize: '16px' 
          }}>
            Set up your personal information to join competitions
          </p>
        </div>

        {/* Form section */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(8px)',
          borderRadius: '24px',
          padding: '32px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <form onSubmit={handleSubmit}>
            {/* Basic Information Section */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>👤</span>
                Basic Information
              </h3>

              <div style={{ 
                display: 'grid', 
                gap: '20px' 
              }}>
                {/* Nickname */}
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151'
                  }}>
                    🏷️ Nickname *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your nickname"
                    value={nickname}
                    onChange={(e) => {
                      setNickname(e.target.value);
                      if (errors.nickname) {
                        setErrors(prev => ({ ...prev, nickname: '' }));
                      }
                    }}
                    required
                    style={{
                      width: '100%',
                      border: errors.nickname ? '2px solid #ef4444' : '2px solid #e5e7eb',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      fontSize: '16px',
                      transition: 'all 0.3s ease',
                      background: 'rgba(255, 255, 255, 0.9)'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = errors.nickname ? '#ef4444' : '#3b82f6';
                      e.target.style.boxShadow = `0 0 0 3px rgba(${errors.nickname ? '239, 68, 68' : '59, 130, 246'}, 0.1)`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = errors.nickname ? '#ef4444' : '#e5e7eb';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  {errors.nickname && (
                    <p style={{
                      color: '#ef4444',
                      fontSize: '12px',
                      marginTop: '4px',
                      fontWeight: '500'
                    }}>
                      {errors.nickname}
                    </p>
                  )}
                </div>

                {/* Major */}
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151'
                  }}>
                    🎓 Major *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your major"
                    value={major}
                    onChange={(e) => {
                      setMajor(e.target.value);
                      if (errors.major) {
                        setErrors(prev => ({ ...prev, major: '' }));
                      }
                    }}
                    required
                    style={{
                      width: '100%',
                      border: errors.major ? '2px solid #ef4444' : '2px solid #e5e7eb',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      fontSize: '16px',
                      transition: 'all 0.3s ease',
                      background: 'rgba(255, 255, 255, 0.9)'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = errors.major ? '#ef4444' : '#3b82f6';
                      e.target.style.boxShadow = `0 0 0 3px rgba(${errors.major ? '239, 68, 68' : '59, 130, 246'}, 0.1)`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = errors.major ? '#ef4444' : '#e5e7eb';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  {errors.major && (
                    <p style={{
                      color: '#ef4444',
                      fontSize: '12px',
                      marginTop: '4px',
                      fontWeight: '500'
                    }}>
                      {errors.major}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Skills Section */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>⚡</span>
                Skills *
                {skills.length > 0 && (
                  <span style={{
                    background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                    color: 'white',
                    fontSize: '12px',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontWeight: '500'
                  }}>
                    {skills.length} selected
                  </span>
                )}
              </h3>

              <div style={{
                background: 'rgba(255, 255, 255, 0.6)',
                borderRadius: '16px',
                border: errors.skills ? '2px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.3)',
                padding: errors.skills ? '18px' : '20px'
              }}>
                {Object.entries(skillCategories).map(([category, categorySkills]) => (
                  <div key={category} style={{
                    marginBottom: '16px',
                    background: 'rgba(255, 255, 255, 0.4)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid rgba(255, 255, 255, 0.3)'
                  }}>
                    {/* Category header button */}
                    <button
                      type="button"
                      onClick={() => {
                        toggleCategory(category);
                        if (errors.skills) {
                          setErrors(prev => ({ ...prev, skills: '' }));
                        }
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '12px 16px',
                        background: expandedCategories[category] ? 'rgba(59, 130, 246, 0.1)' : 'rgba(249, 250, 251, 0.8)',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#374151',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = expandedCategories[category] ? 'rgba(59, 130, 246, 0.1)' : 'rgba(249, 250, 251, 0.8)';
                      }}
                    >
                      <span style={{
                        transition: 'transform 0.3s ease',
                        transform: expandedCategories[category] ? 'rotate(90deg)' : 'rotate(0deg)',
                        color: '#3b82f6'
                      }}>
                        ▶
                      </span>
                      {category}
                      <span style={{
                        marginLeft: 'auto',
                        fontSize: '12px',
                        color: '#6b7280',
                        background: 'rgba(59, 130, 246, 0.1)',
                        padding: '2px 6px',
                        borderRadius: '8px'
                      }}>
                        {categorySkills.filter(skill => skills.includes(skill)).length}/{categorySkills.length}
                      </span>
                    </button>
                    
                    {/* Skill options */}
                    {expandedCategories[category] && (
                      <div style={{
                        padding: '16px',
                        background: 'rgba(255, 255, 255, 0.3)',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                        gap: '8px'
                      }}>
                        {categorySkills.map((skill) => {
                          const selected = skills.includes(skill);
                          return (
                            <label
                              key={skill}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                border: selected ? '2px solid #3b82f6' : '2px solid #e5e7eb',
                                background: selected ? 'linear-gradient(90deg, #3b82f6, #8b5cf6)' : 'rgba(255, 255, 255, 0.8)',
                                color: selected ? 'white' : '#374151',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                fontSize: '12px',
                                fontWeight: selected ? '600' : '500'
                              }}
                              onMouseEnter={(e) => {
                                if (!selected) {
                                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                                  e.currentTarget.style.borderColor = '#3b82f6';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!selected) {
                                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)';
                                  e.currentTarget.style.borderColor = '#e5e7eb';
                                }
                              }}
                            >
                              <input
                                type="checkbox"
                                value={skill}
                                checked={selected}
                                onChange={() => {
                                  handleCheckboxChange(skill);
                                  if (errors.skills) {
                                    setErrors(prev => ({ ...prev, skills: '' }));
                                  }
                                }}
                                style={{ display: 'none' }}
                              />
                              <span style={{ fontSize: '14px' }}>
                                {selected ? '✅' : '⚪'}
                              </span>
                              {skill}
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {errors.skills && (
                <p style={{
                  color: '#ef4444',
                  fontSize: '12px',
                  marginTop: '8px',
                  fontWeight: '500'
                }}>
                  {errors.skills}
                </p>
              )}
            </div>

            {/* Self Introduction Section */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>📝</span>
                Self Introduction
                <span style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  fontWeight: '400'
                }}>
                  (Optional)
                </span>
              </h3>

              <textarea
                placeholder="Share your experience, interests, or special skills..."
                value={selfIntro}
                onChange={(e) => setSelfIntro(e.target.value)}
                rows={5}
                style={{
                  width: '100%',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  fontSize: '16px',
                  transition: 'all 0.3s ease',
                  background: 'rgba(255, 255, 255, 0.9)',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Resume Upload Section */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>📄</span>
                Resume Upload
                <span style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  fontWeight: '400'
                }}>
                  (Optional)
                </span>
              </h3>

              <div style={{
                border: '2px dashed #d1d5db',
                borderRadius: '12px',
                padding: '24px',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                background: 'rgba(255, 255, 255, 0.6)'
              }}>
                <div style={{ marginBottom: '16px' }}>
                  <span style={{ fontSize: '32px' }}>📎</span>
                </div>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  style={{
                    marginBottom: '12px',
                    fontSize: '14px'
                  }}
                />
                {resumeFile && (
                  <p style={{
                    color: '#059669',
                    fontSize: '14px',
                    fontWeight: '500',
                    margin: '8px 0 0 0'
                  }}>
                    ✅ File selected: {resumeFile.name}
                  </p>
                )}
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  margin: '8px 0 0 0'
                }}>
                  PDF format only
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: loading ? 'linear-gradient(90deg, #9ca3af, #9ca3af)' : 'linear-gradient(90deg, #059669, #10b981)',
                color: 'white',
                fontSize: '18px',
                fontWeight: '600',
                padding: '16px 32px',
                borderRadius: '16px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = 'linear-gradient(90deg, #047857, #059669)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(5, 150, 105, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = 'linear-gradient(90deg, #059669, #10b981)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  {uploading ? 'Uploading...' : 'Saving...'}
                </>
              ) : (
                <>
                  Save & Go to Competitions
                  <span>🚀</span>
                </>
              )}
            </button>
          </form>

          {/* Message Display */}
          {message && (
            <div style={{
              marginTop: '20px',
              padding: '16px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '500',
              textAlign: 'center',
              background: message.startsWith('✅') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: message.startsWith('✅') ? '#059669' : '#dc2626',
              border: `1px solid ${message.startsWith('✅') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
            }}>
              {message}
            </div>
          )}
        </div>

        {/* Bottom Hint */}
        <div style={{
          marginTop: '32px',
          background: 'rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(8px)',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          textAlign: 'center'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '8px'
          }}>
            💡 After Profile Setup
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            margin: 0
          }}>
            You'll be able to join competitions and match with other participants
          </p>
        </div>
      </div>

      {/* CSS animations and responsive styles */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 640px) {
          .hidden-mobile {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}