import React, { useCallback } from 'react';
import '../../styles/ApplicantsModal.css'; // Path relative to components/

function ApplicantsModal({ task, onClose, onHire, onViewApplicantInfo }) {
    if (!task) return null;

    // Helper to get initials for applicant cards
    const getInitials = useCallback((name = '') => {
        const parts = name.split(' ');
        if (parts.length > 1) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        } else if (name) {
            return name.substring(0, 2).toUpperCase();
        }
        return 'US';
    }, []);

    return (
        <div className="modal-overlay">
            <div className="applicants-modal-content">
                <div className="modal-header">
                    <h2>Applicants for: {task.jobTitle}</h2>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>
                <div className="applicants-list">
                    {task.applicants && task.applicants.length > 0 ? (
                        task.applicants.map(applicant => (
                            <div key={applicant.id} className="applicant-card">
                                <div className="applicant-initials-name">
                                    <div className="applicant-initials">{getInitials(applicant.name)}</div>
                                    <span className="applicant-name">{applicant.name}</span>
                                </div>
                                <div className="applicant-skills">
                                    {applicant.skills.map((skill, index) => (
                                        <span key={index} className="skill-tag">{skill}</span>
                                    ))}
                                </div>
                                <div className="applicant-actions">
                                    <button
                                        className="view-info-button"
                                        onClick={() => onViewApplicantInfo(applicant.id)}
                                    >
                                        View
                                    </button>
                                    <button
                                        className="hire-button"
                                        onClick={() => onHire(task.id, applicant.id, applicant.name)}
                                        // Disable hire button if task is already filled
                                        disabled={task.status === 'filled'}
                                    >
                                        Hire
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="no-applicants">No applicants for this task yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ApplicantsModal;