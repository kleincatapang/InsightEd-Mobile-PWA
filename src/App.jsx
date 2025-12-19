import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// --- AUTH ---
import Login from './Login';
import Register from './Register';

// --- DASHBOARDS & MODULES ---
import EngineerDashboard from './modules/EngineerDashboard'; 
import SchoolHeadDashboard from './modules/SchoolHeadDashboard';
import HRDashboard from './modules/HRDashboard';
import AdminDashboard from './modules/AdminDashboard'; 
import UserProfile from './modules/UserProfile'; 
import Activity from './modules/Activity';    
import Outbox from './modules/Outbox';             // From File 2
import ProjectGallery from './modules/ProjectGallery'; // From File 1

// --- FORM MENUS ---
import SchoolForms from './modules/SchoolForms';
import EngineerForms from './modules/EngineerForms'; 

// --- FORMS IMPORTS ---

// 1. School Head Forms
import SchoolProfile from './forms/SchoolProfile';
import SchoolInformation from './forms/SchoolInformation';
import Enrolement from './forms/Enrolment';
import OrganizedClasses from './forms/OrganizedClasses';
import TeachingPersonnel from './forms/TeachingPersonnel';
import ShiftingModalities from './forms/ShiftingModalities'; // From File 2
import TeacherSpecialization from './forms/TeacherSpecialization';

// 2. Engineer Forms
import EngineerSchoolInfrastructure from './forms/EngineerSchoolInfrastructure';
import EngineerSchoolResources from './forms/EngineerSchoolResources';           
import DamageAssessment from './forms/DamageAssessment';
import ProjectMonitoring from './forms/ProjectMonitoring';
import SiteInspection from './forms/SiteInspection';
import MaterialInventory from './forms/MaterialInventory';
import NewProjects from './modules/NewProjects';
import DetailedProjInfo from './modules/DetailedProjInfo'; 


function App() {
  return (
    <Router>
      <Routes>
        {/* ==========================
            AUTHENTICATION 
           ========================== */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* ==========================
            DASHBOARDS 
           ========================== */}
        <Route path="/engineer-dashboard" element={<EngineerDashboard />} />
        <Route path="/schoolhead-dashboard" element={<SchoolHeadDashboard />} />
        <Route path="/hr-dashboard" element={<HRDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        
        {/* ==========================
            USER UTILITIES 
           ========================== */}
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/activities" element={<Activity />} />
        <Route path="/outbox" element={<Outbox />} />
        
        {/* ==========================
            FORM MENUS 
           ========================== */}
        <Route path="/school-forms" element={<SchoolForms />} />
        <Route path="/engineer-forms" element={<EngineerForms />} />

        {/* ==========================
            SCHOOL HEAD FORMS 
           ========================== */}
        <Route path="/school-profile" element={<SchoolProfile />} />
        <Route path="/school-information" element={<SchoolInformation />} />
        <Route path="/enrolment" element={<Enrolement />} />
        <Route path="/organized-classes" element={<OrganizedClasses />} />
        <Route path="/teaching-personnel" element={<TeachingPersonnel />} />
        <Route path="/shifting-modality" element={<ShiftingModalities />} />
        <Route path="/teacher-specialization" element={<TeacherSpecialization />} />

        {/* ==========================
            ENGINEER FORMS 
           ========================== */}
        <Route path="/school-infrastructure" element={<EngineerSchoolInfrastructure />} />
        <Route path="/school-resources" element={<EngineerSchoolResources />} />
        <Route path="/damage-assessment" element={<DamageAssessment />} />
        <Route path="/project-monitoring" element={<ProjectMonitoring />} />
        <Route path="/site-inspection" element={<SiteInspection />} />
        <Route path="/material-inventory" element={<MaterialInventory />} />
        
        {/* Project Management */}
        <Route path="/new-project" element={<NewProjects />} /> 
        <Route path="/project-details/:id" element={<DetailedProjInfo />} /> 

        {/* Project Gallery */}
        <Route path="/project-gallery" element={<ProjectGallery />} />
        <Route path="/project-gallery/:projectId" element={<ProjectGallery />} />

      </Routes>
    </Router>
  );
}

export default App;