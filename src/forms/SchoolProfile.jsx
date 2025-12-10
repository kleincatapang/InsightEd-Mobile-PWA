import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse'; 
import { auth } from '../firebase'; 
import { onAuthStateChanged } from "firebase/auth";
import locationData from '../locations.json'; 

const SchoolProfile = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true); // Blocks UI while checking
    const [isSaving, setIsSaving] = useState(false);
    
    // UI States
    const [isLocked, setIsLocked] = useState(false); 
    const [showConfirmModal, setShowConfirmModal] = useState(false); 
    const [isChecked, setIsChecked] = useState(false); 

    // Dropdown Data
    const [provinceOptions, setProvinceOptions] = useState([]);
    const [cityOptions, setCityOptions] = useState([]);
    const [barangayOptions, setBarangayOptions] = useState([]);
    const [divisionOptions, setDivisionOptions] = useState([]);
    const [districtOptions, setDistrictOptions] = useState([]);
    const [legDistrictOptions, setLegDistrictOptions] = useState([]);
    const [districtMap, setDistrictMap] = useState({});

    const [formData, setFormData] = useState({
        schoolId: '', schoolName: '', 
        region: '', province: '', municipality: '', barangay: '', 
        division: '', district: '', legDistrict: '', 
        motherSchoolId: '', latitude: '', longitude: ''
    });

    const goBack = () => navigate('/school-forms');

    // --- 1. INITIAL LOAD LOGIC ---
    useEffect(() => {
        let isMounted = true;

        const initialize = async () => {
            // A. Load CSV Data for Dropdowns (Required for both New and Existing)
            await new Promise((resolve) => {
                Papa.parse('/schools.csv', {
                    download: true, header: true, skipEmptyLines: true,
                    complete: (results) => {
                        if (!isMounted) return;
                        const rows = results.data;
                        if (rows && rows.length > 0) {
                            const headers = Object.keys(rows[0]);
                            const clean = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
                            
                            const divKey = headers.find(h => clean(h) === 'division');
                            const distKey = headers.find(h => clean(h) === 'district'); 
                            const legKey = headers.find(h => clean(h).includes('legislative') || clean(h) === 'legdistrict');

                            const divs = new Set(), legs = new Set(), dMap = {};

                            rows.forEach(row => {
                                const div = divKey ? row[divKey]?.trim() : null;
                                const dist = distKey ? row[distKey]?.trim() : null;
                                const leg = legKey ? row[legKey]?.trim() : null;
                                if (div) {
                                    divs.add(div);
                                    if (!dMap[div]) dMap[div] = new Set();
                                    if (dist) dMap[div].add(dist);
                                }
                                if (leg) legs.add(leg);
                            });

                            setDivisionOptions(Array.from(divs).sort());
                            setLegDistrictOptions(Array.from(legs).sort());
                            const processedMap = {};
                            Object.keys(dMap).forEach(key => processedMap[key] = Array.from(dMap[key]).sort());
                            setDistrictMap(processedMap);
                        }
                        resolve();
                    }
                });
            });

            // B. CHECK DATABASE BY USER ID
            onAuthStateChanged(auth, async (user) => {
                if (!isMounted) return;
                
                if (user) {
                    try {
                        // ASK SERVER: "Did this user submit already?"
                        const response = await fetch(`http://localhost:3000/api/school-by-user/${user.uid}`);
                        const result = await response.json();
                        
                        if (result.exists) {
                            const dbData = result.data;
                            
                            // 1. Restore Dropdown Options based on saved data
                            if (locationData[dbData.region]) {
                                setProvinceOptions(Object.keys(locationData[dbData.region]).sort());
                            }
                            if (locationData[dbData.region]?.[dbData.province]) {
                                setCityOptions(Object.keys(locationData[dbData.region][dbData.province]).sort());
                            }
                            if (locationData[dbData.region]?.[dbData.province]?.[dbData.municipality]) {
                                setBarangayOptions(locationData[dbData.region][dbData.province][dbData.municipality].sort());
                            }
                            if (dbData.division && districtMap[dbData.division]) {
                                setDistrictOptions(districtMap[dbData.division]); // Restore Districts
                            }

                            // 2. Populate Form & LOCK IT
                            setFormData({
                                schoolId: dbData.school_id, schoolName: dbData.school_name,
                                region: dbData.region, province: dbData.province, municipality: dbData.municipality, barangay: dbData.barangay,
                                division: dbData.division, district: dbData.district, legDistrict: dbData.leg_district,
                                motherSchoolId: dbData.mother_school_id, latitude: dbData.latitude, longitude: dbData.longitude
                            });
                            
                            setIsLocked(true); // <--- THIS DISABLES EVERYTHING
                        }
                    } catch (error) {
                        console.error("Auto-load failed:", error);
                    }
                }
                setLoading(false); // Stop loading spinner
            });
        };

        initialize();
        return () => { isMounted = false; };
    }, []);

    // --- HANDLERS ---
    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleRegionChange = (e) => {
        const region = e.target.value;
        setFormData(prev => ({ ...prev, region, province: '', municipality: '', barangay: '' }));
        setProvinceOptions(region && locationData[region] ? Object.keys(locationData[region]).sort() : []);
        setCityOptions([]); setBarangayOptions([]);
    };
    const handleProvinceChange = (e) => {
        const province = e.target.value;
        setFormData(prev => ({ ...prev, province, municipality: '', barangay: '' }));
        setCityOptions(province && formData.region ? Object.keys(locationData[formData.region][province]).sort() : []);
        setBarangayOptions([]);
    };
    const handleCityChange = (e) => {
        const municipality = e.target.value;
        setFormData(prev => ({ ...prev, municipality, barangay: '' }));
        setBarangayOptions(municipality && formData.province ? locationData[formData.region][formData.province][municipality].sort() : []);
    };
    const handleDivisionChange = (e) => {
        const division = e.target.value;
        setFormData(prev => ({ ...prev, division, district: '' }));
        setDistrictOptions(districtMap[division] || []);
    };

    // --- CSV AUTO-FILL (For New Users Only) ---
    const handleIdBlur = async () => {
        const targetId = String(formData.schoolId).trim();
        if (targetId.length < 6 || isLocked) return; 
        
        setLoading(true);

        // Check if ID is taken by SOMEONE ELSE
        try {
            const response = await fetch(`http://localhost:3000/api/check-school/${targetId}`);
            if (response.ok) {
                const result = await response.json();
                if (result.exists) {
                    alert("This School ID is already registered.");
                    setFormData(prev => ({...prev, schoolId: ''})); 
                    setLoading(false);
                    return;
                }
            }
        } catch (error) { console.warn("DB Check skipped."); }

        // Proceed to CSV Search
        Papa.parse('/schools.csv', {
            download: true, header: true, skipEmptyLines: true,
            complete: (results) => {
                const rows = results.data;
                const headers = Object.keys(rows[0] || {});
                const clean = (str) => str?.toLowerCase().replace(/[^a-z0-9]/g, '') || '';
                const idKey = headers.find(h => clean(h) === 'schoolid');

                if (idKey) {
                    const school = rows.find(s => String(s[idKey]).trim().split('.')[0] === targetId);
                    if (school) {
                        const getVal = (target) => {
                            const k = headers.find(h => clean(h).includes(clean(target)));
                            return k ? String(school[k]).trim() : '';
                        };
                        const findMatch = (options, value) => options.find(opt => clean(opt) === clean(value)) || value;

                        // Match Locations
                        const rawRegion = getVal('region'), rawProv = getVal('province'), rawMun = getVal('municipality'), rawBrgy = getVal('barangay');
                        const matchedRegion = findMatch(Object.keys(locationData), rawRegion);
                        
                        let provOpts = [], matchedProv = rawProv;
                        if (locationData[matchedRegion]) {
                            provOpts = Object.keys(locationData[matchedRegion]).sort();
                            matchedProv = findMatch(provOpts, rawProv);
                        }
                        let cityOpts = [], matchedMun = rawMun;
                        if (locationData[matchedRegion]?.[matchedProv]) {
                            cityOpts = Object.keys(locationData[matchedRegion][matchedProv]).sort();
                            matchedMun = findMatch(cityOpts, rawMun);
                        }
                        let brgyOpts = [], matchedBrgy = rawBrgy;
                        if (locationData[matchedRegion]?.[matchedProv]?.[matchedMun]) {
                            brgyOpts = locationData[matchedRegion][matchedProv][matchedMun].sort();
                            matchedBrgy = findMatch(brgyOpts, rawBrgy);
                        }

                        // Match DepEd Fields
                        const rawDiv = getVal('division');
                        const matchedDiv = findMatch(divisionOptions, rawDiv);
                        setDistrictOptions(districtMap[matchedDiv] || []);

                        setProvinceOptions(provOpts); setCityOptions(cityOpts); setBarangayOptions(brgyOpts);

                        setFormData(prev => ({
                            ...prev,
                            schoolName: getVal('schoolname'),
                            region: matchedRegion, province: matchedProv, municipality: matchedMun, barangay: matchedBrgy,
                            division: matchedDiv, district: getVal('district'), legDistrict: getVal('legdistrict') || getVal('legislative'),
                            motherSchoolId: getVal('motherschool') || '', latitude: getVal('latitude'), longitude: getVal('longitude')
                        }));
                    } else { alert("School ID not found in CSV."); }
                }
                setLoading(false);
            },
            error: (err) => { console.error(err); setLoading(false); }
        });
    };

    const handleSaveClick = (e) => { e.preventDefault(); if (!auth.currentUser) return; setShowConfirmModal(true); };
    
    const confirmSave = async () => {
        setShowConfirmModal(false); setIsSaving(true);
        const payload = { ...formData, submittedBy: auth.currentUser.uid };
        try {
            const response = await fetch('http://localhost:3000/api/save-school', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
            });
            if (response.ok) {
                alert('Success: Profile saved permanently.'); setIsLocked(true); goBack();
            } else {
                const err = await response.json(); alert('Failed: ' + err.message);
            }
        } catch (error) { alert("Error."); } finally { setIsSaving(false); }
    };

    // --- STYLES ---
    const inputClass = `w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#004A99] bg-white text-gray-800 font-semibold text-[15px] shadow-sm disabled:bg-gray-100 disabled:text-gray-500`;
    const labelClass = "block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 ml-1";

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans p-4 md:p-8 pb-24 relative"> 
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-red-100">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4"><span className="text-3xl">⚖️</span></div>
                        <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Legal Confirmation</h3>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 text-sm text-gray-700 text-center">
                            <p className="font-semibold text-gray-900 mb-2">"I confirm that I am the SCHOOL HEAD and that all information I provide is TRUE and ACCURATE."</p>
                        </div>
                        <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer mb-6">
                            <input type="checkbox" checked={isChecked} onChange={(e) => setIsChecked(e.target.checked)} className="mt-1 w-5 h-5 text-[#004A99] rounded focus:ring-[#004A99]" />
                            <span className="text-sm text-gray-600 select-none">I acknowledge that I have read and understood the information above.</span>
                        </label>
                        <div className="flex gap-3">
                            <button onClick={() => setShowConfirmModal(false)} className="flex-1 py-3.5 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50">Cancel</button>
                            <button onClick={confirmSave} disabled={!isChecked} className={`flex-1 py-3.5 rounded-xl text-white font-bold shadow-lg ${isChecked ? 'bg-[#CC0000] hover:bg-[#A30000]' : 'bg-gray-300 cursor-not-allowed'}`}>Confirm & Submit</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-3xl mx-auto">
                <header className="flex items-center justify-between mb-8">
                    <button onClick={goBack} className="text-[#004A99] text-2xl">&larr;</button>
                    <h1 className="text-2xl md:text-3xl font-bold text-[#CC0000]">🏫 School Profile</h1>
                    <div className="w-6"></div> 
                </header>

                <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-white">
                    <form onSubmit={handleSaveClick} className="space-y-6">
                        
                        <div className={`flex justify-between items-center px-4 py-3 rounded-xl border mb-6 ${isLocked ? 'bg-orange-50 border-orange-200' : 'bg-blue-50/50 border-blue-100'}`}>
                            <p className={`text-sm font-medium flex items-center gap-2 ${isLocked ? 'text-orange-800' : 'text-[#004A99]'}`}>
                                <span>{isLocked ? '🔒' : 'ℹ️'}</span> 
                                {isLocked ? "Profile Submitted & Locked." : "Enter School ID to auto-fill."}
                            </p>
                            {loading && <span className="text-xs text-blue-600 font-bold animate-pulse">Loading...</span>}
                        </div>
                        
                        <div className="relative">
                            <label className={labelClass}>School ID (6-Digit)</label>
                            <input type="text" name="schoolId" value={formData.schoolId} onChange={handleChange} onBlur={handleIdBlur}
                                placeholder="100001" maxLength="6" className={`${inputClass} text-center text-2xl tracking-widest text-[#004A99] font-bold`} required disabled={isLocked} />
                        </div>

                        <div className="grid gap-5 grid-cols-1 md:grid-cols-2">
                            <div className="md:col-span-2"><label className={labelClass}>School Name</label><input type="text" name="schoolName" value={formData.schoolName} onChange={handleChange} className={inputClass} required disabled={isLocked} /></div>

                            {/* --- DROPDOWNS --- */}
                            <div><label className={labelClass}>Region</label><select name="region" value={formData.region} onChange={handleRegionChange} className={inputClass} disabled={isLocked} required><option value="">Select Region</option>{Object.keys(locationData).sort().map(r => <option key={r} value={r}>{r}</option>)}</select></div>
                            <div><label className={labelClass}>Province</label><select name="province" value={formData.province} onChange={handleProvinceChange} className={inputClass} disabled={!formData.region || isLocked} required><option value="">Select Province</option>{provinceOptions.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                            <div><label className={labelClass}>Municipality / City</label><select name="municipality" value={formData.municipality} onChange={handleCityChange} className={inputClass} disabled={!formData.province || isLocked} required><option value="">Select City/Mun</option>{cityOptions.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                            <div><label className={labelClass}>Barangay</label><select name="barangay" value={formData.barangay} onChange={handleChange} className={inputClass} disabled={!formData.municipality || isLocked} required><option value="">Select Barangay</option>{barangayOptions.map(b => <option key={b} value={b}>{b}</option>)}</select></div>
                            <div><label className={labelClass}>Division</label><select name="division" value={formData.division} onChange={handleDivisionChange} className={inputClass} disabled={isLocked} required><option value="">Select Division</option>{divisionOptions.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
                            <div><label className={labelClass}>District</label><select name="district" value={formData.district} onChange={handleChange} className={inputClass} disabled={!formData.division || isLocked} required><option value="">Select District</option>{districtOptions.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
                            <div><label className={labelClass}>Legislative District</label><select name="legDistrict" value={formData.legDistrict} onChange={handleChange} className={inputClass} disabled={isLocked} required><option value="">Select District</option>{legDistrictOptions.map(l => <option key={l} value={l}>{l}</option>)}</select></div>

                            <div><label className={labelClass}>Mother School ID</label><input type="text" name="motherSchoolId" value={formData.motherSchoolId} onChange={handleChange} className={inputClass} disabled={isLocked} /></div>
                            
                            <div className="md:col-span-2 grid grid-cols-2 gap-4 bg-slate-50 p-5 rounded-2xl border border-dashed border-gray-200 mt-2">
                                <div className="col-span-2 text-xs font-bold text-gray-400 uppercase tracking-widest">📍 Geo-Location</div>
                                <div><label className={labelClass}>Latitude</label><input type="text" name="latitude" value={formData.latitude} onChange={handleChange} className={inputClass} disabled={isLocked} /></div>
                                <div><label className={labelClass}>Longitude</label><input type="text" name="longitude" value={formData.longitude} onChange={handleChange} className={inputClass} disabled={isLocked} /></div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 pt-8 border-t border-gray-100 mt-8">
                            <button type="button" onClick={goBack} className="px-6 py-3.5 rounded-xl text-gray-500 font-semibold hover:bg-gray-100 transition">
                                {isLocked ? "Back to Menu" : "Cancel"}
                            </button>
                            {!isLocked && (
                                <button type="submit" disabled={isSaving} className="px-6 py-3.5 rounded-xl bg-[#CC0000] text-white font-bold hover:bg-[#A30000] shadow-lg flex items-center gap-2">
                                    {isSaving ? "Saving..." : "Save Profile"}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SchoolProfile;