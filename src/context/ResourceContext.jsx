import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  INITIAL_COURSES, 
  INITIAL_INSTRUCTORS, 
  INITIAL_RESOURCES, 
  INITIAL_PENDING_UPLOADS 
} from '../data/initialSeedData';
import { cacheFile } from '../services/fileCache';
import { deleteFileFromR2 } from '../services/r2Storage';
import { 
  fetchResourcesFromSupabase, 
  saveResourceToSupabase, 
  syncAllResourcesToSupabase,
  incrementDownloadsInSupabase,
  fetchCoursesFromSupabase,
  saveCourseToSupabase,
  syncAllCoursesToSupabase,
  deleteCourseFromSupabase,
  fetchInstructorsFromSupabase,
  saveInstructorToSupabase,
  syncAllInstructorsToSupabase,
  deleteInstructorFromSupabase,
  deleteResourceFromSupabase
} from '../services/dbService';

const ResourceContext = createContext();

export function ResourceProvider({ children }) {
  // Navigation State synced with Browser Hash & History
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'course-detail' | 'instructor-detail' | 'category-files' | 'upload' | 'admin'
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [selectedInstructorId, setSelectedInstructorId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null); // 'past-paper' | 'quiz' | 'assignment' | 'other'
  const [searchQuery, setSearchQuery] = useState('');

  // Toast Notification State
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 4000);
  };

  // Helper to deduplicate array items by unique ID
  const deduplicateById = (list) => {
    const seen = new Set();
    return (list || []).filter(item => {
      if (!item || !item.id) return false;
      const key = String(item.id);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  // Persistent Data States with Safe Fallback
  const [courses, setCourses] = useState(() => {
    try {
      const saved = localStorage.getItem('comsats_courses');
      return saved ? JSON.parse(saved) : INITIAL_COURSES;
    } catch (e) {
      return INITIAL_COURSES;
    }
  });

  const [instructors, setInstructors] = useState(() => {
    try {
      const saved = localStorage.getItem('comsats_instructors');
      return saved ? JSON.parse(saved) : INITIAL_INSTRUCTORS;
    } catch (e) {
      return INITIAL_INSTRUCTORS;
    }
  });

  const [resources, setResources] = useState(() => {
    try {
      const saved = localStorage.getItem('comsats_resources');
      const parsed = saved ? JSON.parse(saved) : INITIAL_RESOURCES;
      return deduplicateById(parsed);
    } catch (e) {
      return deduplicateById(INITIAL_RESOURCES);
    }
  });

  // Fetch shared resources, courses, & instructors from Supabase Database on App Load & Tab Focus
  useEffect(() => {
    async function loadRemoteData() {
      // 1. Fetch Resources & Pending Uploads
      try {
        const remoteResources = await fetchResourcesFromSupabase();
        if (remoteResources && remoteResources.length > 0) {
          console.log('[COMSATS Vault] Remote Resources Loaded from Supabase DB:', remoteResources.length);
          const approved = remoteResources.filter(r => r.status === 'approved' && !String(r.id).startsWith('upload-'));
          const pending = remoteResources.filter(r => r.status === 'pending' || String(r.id).startsWith('upload-'));
          setResources(approved);
          setPendingUploads(prevPending => deduplicateById([...pending, ...prevPending.filter(p => p.status === 'pending')]));
        } else {
          // Auto-sync initial resources & pending uploads to Supabase
          syncAllResourcesToSupabase([...INITIAL_RESOURCES, ...INITIAL_PENDING_UPLOADS]);
        }
      } catch (e) {
        console.warn('Supabase resources fetch warning:', e);
      }

      // 2. Fetch Custom Courses & Auto-sync Local Courses if DB table is empty
      try {
        const remoteCourses = await fetchCoursesFromSupabase();
        if (remoteCourses && remoteCourses.length > 0) {
          setCourses(remoteCourses);
        } else {
          // Push local courses to Supabase if database table was just created
          syncAllCoursesToSupabase(courses);
        }
      } catch (e) {
        // Ignore if error
      }

      // 3. Fetch Custom Instructors & Auto-sync Local Instructors if DB table is empty
      try {
        const remoteInstructors = await fetchInstructorsFromSupabase();
        if (remoteInstructors && remoteInstructors.length > 0) {
          setInstructors(remoteInstructors);
        } else {
          // Push local instructors to Supabase if database table was just created
          syncAllInstructorsToSupabase(instructors);
        }
      } catch (e) {
        // Ignore if error
      }
    }
    
    loadRemoteData();


    const handleFocus = () => loadRemoteData();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const [pendingUploads, setPendingUploads] = useState(() => {
    try {
      const saved = localStorage.getItem('comsats_pending_uploads');
      return saved ? JSON.parse(saved) : INITIAL_PENDING_UPLOADS;
    } catch (e) {
      return INITIAL_PENDING_UPLOADS;
    }
  });

  // Safe LocalStorage Syncing (prevents QuotaExceededError crashes on large 7MB+ file uploads)
  useEffect(() => {
    try {
      localStorage.setItem('comsats_courses', JSON.stringify(courses));
    } catch (e) {
      console.warn('LocalStorage save warning:', e);
    }
  }, [courses]);

  useEffect(() => {
    try {
      localStorage.setItem('comsats_instructors', JSON.stringify(instructors));
    } catch (e) {
      console.warn('LocalStorage save warning:', e);
    }
  }, [instructors]);

  useEffect(() => {
    try {
      const safeResources = resources.map(({ rawFile, ...r }) => ({
        ...r,
        url: (r.url && r.url.startsWith('data:')) ? '' : r.url
      }));
      localStorage.setItem('comsats_resources', JSON.stringify(safeResources));
    } catch (e) {
      console.warn('LocalStorage save warning:', e);
    }
  }, [resources]);

  useEffect(() => {
    try {
      // Store lightweight pending upload metadata in localStorage to prevent 5MB browser quota crashes
      const safeUploads = pendingUploads.map(item => ({
        ...item,
        // Trim massive file strings for local storage safety
        downloadContent: item.downloadContent && item.downloadContent.length > 5000
          ? item.downloadContent.substring(0, 2000) + '\n...[Content truncated for storage efficiency]'
          : item.downloadContent
      }));
      localStorage.setItem('comsats_pending_uploads', JSON.stringify(safeUploads));
    } catch (e) {
      console.warn('LocalStorage quota limit reached, storing pending upload in memory:', e);
    }
  }, [pendingUploads]);

  // Sync state from Browser URL Hash (Enables Browser Back & Forward Buttons)
  const parseHashAndSyncState = () => {
    const hash = window.location.hash || '#/';
    
    if (hash.startsWith('#/upload')) {
      setCurrentView('upload');
    } else if (hash.startsWith('#/admin')) {
      setCurrentView('admin');
    } else if (hash.startsWith('#/category')) {
      const params = new URLSearchParams(hash.split('?')[1] || '');
      setCurrentView('category-files');
      if (params.get('c')) setSelectedCourseId(params.get('c'));
      if (params.get('i')) setSelectedInstructorId(params.get('i'));
      if (params.get('cat')) setSelectedCategory(params.get('cat'));
    } else if (hash.startsWith('#/instructor')) {
      const params = new URLSearchParams(hash.split('?')[1] || '');
      setCurrentView('instructor-detail');
      if (params.get('c')) setSelectedCourseId(params.get('c'));
      if (params.get('i')) setSelectedInstructorId(params.get('i'));
    } else if (hash.startsWith('#/course')) {
      const params = new URLSearchParams(hash.split('?')[1] || '');
      setCurrentView('course-detail');
      if (params.get('c')) setSelectedCourseId(params.get('c'));
    } else {
      setCurrentView('home');
    }
  };

  // Listen to Browser Back / Forward buttons
  useEffect(() => {
    parseHashAndSyncState();
    const handleHashChange = () => parseHashAndSyncState();
    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
    };
  }, []);

  // Navigation router helper with History & Hash Sync
  const navigateTo = (view, params = {}) => {
    setCurrentView(view);
    const courseId = params.courseId !== undefined ? params.courseId : selectedCourseId;
    const instructorId = params.instructorId !== undefined ? params.instructorId : selectedInstructorId;
    const category = params.category !== undefined ? params.category : selectedCategory;

    if (params.courseId !== undefined) setSelectedCourseId(params.courseId);
    if (params.instructorId !== undefined) setSelectedInstructorId(params.instructorId);
    if (params.category !== undefined) setSelectedCategory(params.category);

    // Build URL hash to enable browser Back/Forward navigation
    let newHash = '#/';
    if (view === 'upload') newHash = '#/upload';
    else if (view === 'admin') newHash = '#/admin';
    else if (view === 'course-detail' && courseId) newHash = `#/course?c=${courseId}`;
    else if (view === 'instructor-detail' && courseId && instructorId) newHash = `#/instructor?c=${courseId}&i=${instructorId}`;
    else if (view === 'category-files' && courseId && instructorId && category) newHash = `#/category?c=${courseId}&i=${instructorId}&cat=${category}`;

    if (window.location.hash !== newHash) {
      window.location.hash = newHash;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper selectors
  const activeCourse = courses.find(c => c.id === selectedCourseId) || null;
  const activeInstructor = instructors.find(i => i.id === selectedInstructorId) || null;

  // Get instructors for a given course
  const getInstructorsForCourse = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return [];
    return instructors.filter(inst => course.instructorIds.includes(inst.id));
  };

  // Get resources for a specific instructor (or across courses)
  const getInstructorResources = (instructorId, courseId = null) => {
    return resources.filter(res => {
      const matchInst = res.instructorId === instructorId;
      const matchCourse = courseId ? res.courseId === courseId : true;
      return matchInst && matchCourse && res.status === 'approved';
    });
  };

  // Get category resources
  const getCategoryResources = (instructorId, courseId, category) => {
    return resources.filter(res => 
      res.instructorId === instructorId &&
      res.courseId === courseId &&
      res.category === category &&
      res.status === 'approved'
    );
  };

  // Check matching title warning for specific directory (courseId + instructorId + category)
  const checkMatchingTitleWarning = (courseId, instructorId, category, title) => {
    if (!title || !title.trim()) return null;
    const normInput = title.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (normInput.length < 3) return null;

    const inputNumbers = (title.match(/\d+/g) || []).join('');

    const allDocs = [...resources, ...pendingUploads];
    const targetDocs = allDocs.filter(r => 
      (courseId ? r.courseId === courseId : true) &&
      (instructorId ? r.instructorId === instructorId : true) &&
      (category ? r.category === category : true)
    );

    for (const doc of targetDocs) {
      if (!doc.title) continue;
      const normExisting = doc.title.toLowerCase().replace(/[^a-z0-9]/g, '');
      const existingNumbers = (doc.title.match(/\d+/g) || []).join('');

      // If both titles contain numbers and the numbers differ (e.g. assignment 2 vs assignment 1), skip warning!
      if (inputNumbers && existingNumbers && inputNumbers !== existingNumbers) {
        continue;
      }

      // 1. Exact normalized title match
      if (normInput === normExisting) {
        return {
          hasWarning: true,
          existingTitle: doc.title,
          reason: `A document titled "${doc.title}" already exists in this directory for the selected course, instructor & category.`
        };
      }

      // 2. Title containment match (e.g. "assignment 1 solved" vs "assignment 1")
      if (normInput.length >= 6 && normExisting.length >= 6) {
        if (normExisting.includes(normInput) || normInput.includes(normExisting)) {
          return {
            hasWarning: true,
            existingTitle: doc.title,
            reason: `A document with a similar title "${doc.title}" already exists for this instructor and category.`
          };
        }
      }
    }

    return null;
  };

  // Submit student upload (enters pending queue)
  const submitUpload = (uploadData) => {
    const uploadId = `upload-${Date.now()}`;

    if (uploadData.rawFile) {
      cacheFile(uploadId, uploadData.rawFile);
    }

    const newUpload = {
      id: uploadId,
      courseId: uploadData.courseId,
      instructorId: uploadData.instructorId,
      category: uploadData.category,
      title: uploadData.title,
      examType: uploadData.examType || 'Regular',
      semesterSession: uploadData.semesterSession || 'Spring 2024',
      fileName: uploadData.fileName || `${uploadData.title}.pdf`,
      fileSize: uploadData.fileSize || '1.5 MB',
      fileType: uploadData.fileType || 'pdf',
      status: 'pending',
      uploaderName: uploadData.uploaderName || 'Student',
      uploaderEmail: uploadData.uploaderEmail || '',
      notes: uploadData.notes || '',
      createdAt: new Date().toISOString().split('T')[0],
      downloadsCount: 0,
      url: uploadData.url || '',
      rawFile: uploadData.rawFile || null,
      downloadContent: uploadData.downloadContent || `Content for ${uploadData.title}`
    };

    setPendingUploads(prev => [newUpload, ...prev]);

    // Save to Supabase SQL Database as pending approval
    saveResourceToSupabase(newUpload);

    showToast('Document uploaded successfully! Submitted for Admin approval.', 'success');
  };

  // Admin approves pending upload
  const approveUpload = async (uploadId) => {
    const target = pendingUploads.find(u => u.id === uploadId);
    if (!target) return;

    const approvedItem = {
      ...target,
      status: 'approved'
    };

    setPendingUploads(prev => prev.filter(u => u.id !== uploadId));
    setResources(prev => deduplicateById([approvedItem, ...prev]));
    await saveResourceToSupabase(approvedItem);
    showToast(`Approved document "${target.title}"! Now live on course page.`, 'success');
  };

  // Admin rejects pending upload
  const rejectUpload = async (uploadId) => {
    const target = pendingUploads.find(u => u.id === uploadId);
    setPendingUploads(prev => prev.filter(u => u.id !== uploadId));
    setResources(prev => prev.filter(r => r.id !== uploadId));

    // Delete permanently from Supabase SQL Database
    await deleteResourceFromSupabase(uploadId);

    showToast(`Rejected upload "${target?.title || ''}".`, 'info');
  };

  // Increment download counter
  const incrementDownloads = (resourceId) => {
    setResources(prev => prev.map(r => 
      r.id === resourceId ? { ...r, downloadsCount: (r.downloadsCount || 0) + 1 } : r
    ));
    incrementDownloadsInSupabase(resourceId);
  };

  // Global search filtering across courses and instructors
  const filteredCourses = courses.filter(course => {
    const query = searchQuery.toLowerCase();
    return (
      course.title.toLowerCase().includes(query) ||
      course.code.toLowerCase().includes(query) ||
      course.department.toLowerCase().includes(query)
    );
  });

  // Add new course by admin
  const addCourse = (courseData) => {
    const rawCode = (courseData.code || '').trim();
    const normCode = rawCode.toLowerCase().replace(/[^a-z0-9]/g, '');

    // Check if course with matching code already exists
    const existing = courses.find(c => {
      const cNorm = (c.code || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      return cNorm && cNorm === normCode;
    });

    if (existing) {
      showToast(`Course code "${existing.code}" already exists: ${existing.title}`, 'error');
      return null;
    }

    const newCourse = {
      id: `course-${Date.now()}`,
      code: courseData.code.trim().toUpperCase(),
      title: courseData.title.trim(),
      abbreviation: courseData.abbreviation ? courseData.abbreviation.trim().toUpperCase() : '',
      aliases: courseData.abbreviation 
        ? [courseData.abbreviation.trim().toLowerCase(), courseData.code.trim().toLowerCase(), courseData.title.trim().toLowerCase()] 
        : [courseData.code.trim().toLowerCase(), courseData.title.trim().toLowerCase()],
      department: courseData.department || 'Computer Engineering (CE)',
      semester: 1,
      creditHours: parseInt(courseData.creditHours) || 3,
      description: courseData.description || 'Course study materials and papers repository.',
      iconName: courseData.iconName || 'BookOpen',
      instructorIds: courseData.instructorIds || []
    };

    setCourses(prev => deduplicateById([newCourse, ...prev]));
    saveCourseToSupabase(newCourse);
    showToast(`Added new course "${newCourse.code} - ${newCourse.title}"!`, 'success');
    return newCourse;
  };

  // Update course department/major classification by admin
  const updateCourseDepartment = async (courseId, newDepartment) => {
    const target = courses.find(c => c.id === courseId);
    if (!target) return;

    const updatedCourse = {
      ...target,
      department: newDepartment
    };

    setCourses(prev => prev.map(c => c.id === courseId ? updatedCourse : c));
    await saveCourseToSupabase(updatedCourse);
    showToast(`Updated "${target.code}" department to "${newDepartment}"`, 'success');
  };

  // Check for duplicate instructor name by lowercasing, stripping spaces, and checking 9+ letter substring matches
  const checkDuplicateInstructorName = (newName) => {
    if (!newName || !newName.trim()) return { isDuplicate: false };

    // Convert whole input name to lower case and remove spaces/special chars
    const normNew = newName.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (normNew.length < 3) return { isDuplicate: false };

    for (const inst of instructors) {
      if (!inst.name) continue;
      // Convert available instructor name to lower case without spaces
      const normExisting = inst.name.toLowerCase().replace(/[^a-z0-9]/g, '');

      // 1. Exact match without spaces/case
      if (normNew === normExisting) {
        return {
          isDuplicate: true,
          reason: `An instructor named "${inst.name}" is already registered.`,
          matchedInstructor: inst
        };
      }

      // 2. Check if 9 or more letters match (sliding 9-character window)
      if (normNew.length >= 9 && normExisting.length >= 9) {
        for (let i = 0; i <= normNew.length - 9; i++) {
          const subStr = normNew.substring(i, i + 9);
          if (normExisting.includes(subStr)) {
            return {
              isDuplicate: true,
              reason: `Name "${newName.trim()}" has 9 or more matching letters with existing instructor "${inst.name}".`,
              matchedInstructor: inst
            };
          }
        }
      } else {
        // Containment check for names shorter than 9 letters
        if (normNew.length >= 4 && (normExisting.includes(normNew) || normNew.includes(normExisting))) {
          return {
            isDuplicate: true,
            reason: `Name "${newName.trim()}" is too similar to existing instructor "${inst.name}".`,
            matchedInstructor: inst
          };
        }
      }
    }

    return { isDuplicate: false };
  };

  // Add new instructor by admin
  const addInstructor = (instData) => {
    const dupCheck = checkDuplicateInstructorName(instData.name);
    if (dupCheck.isDuplicate) {
      showToast(dupCheck.reason, 'error');
      return { success: false, reason: dupCheck.reason };
    }

    const instId = `inst-${Date.now()}`;
    const newInstructor = {
      id: instId,
      name: instData.name.trim(),
      title: instData.title || 'Lecturer',
      department: instData.department || 'Computer Engineering (CE)',
      email: instData.email ? instData.email.trim() : `${instData.name.toLowerCase().replace(/\s+/g, '.')}@comsats.edu.pk`,
      office: instData.office || 'Department Block',
      specialization: instData.specialization || 'General Studies',
      rating: 5.0,
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`
    };

    setInstructors(prev => deduplicateById([newInstructor, ...prev]));
    saveInstructorToSupabase(newInstructor);

    // Link new instructor to selected course(s) if specified
    if (instData.courseIds && instData.courseIds.length > 0) {
      setCourses(prevCourses => prevCourses.map(c => {
        if (instData.courseIds.includes(c.id)) {
          return {
            ...c,
            instructorIds: [...new Set([...(c.instructorIds || []), instId])]
          };
        }
        return c;
      }));
    }

    showToast(`Added new instructor "${newInstructor.name}"!`, 'success');
    return { success: true, instructor: newInstructor };
  };

  // Delete course by admin
  const deleteCourse = async (courseId) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    setCourses(prev => prev.filter(c => c.id !== courseId));
    setResources(prev => prev.filter(r => r.courseId !== courseId));
    setPendingUploads(prev => prev.filter(r => r.courseId !== courseId));

    // Delete permanently from Supabase SQL Database
    await deleteCourseFromSupabase(courseId);

    showToast(`Deleted course "${course.code} - ${course.title}"`, 'info');
  };

  // Delete instructor by admin
  const deleteInstructor = async (instructorId) => {
    const inst = instructors.find(i => i.id === instructorId);
    if (!inst) return;

    setInstructors(prev => prev.filter(i => i.id !== instructorId));
    setCourses(prevCourses => prevCourses.map(c => ({
      ...c,
      instructorIds: (c.instructorIds || []).filter(id => id !== instructorId)
    })));

    // Delete permanently from Supabase SQL Database
    await deleteInstructorFromSupabase(instructorId);

    showToast(`Deleted instructor "${inst.name}"`, 'info');
  };

  // Update assigned courses for an instructor by admin
  const updateInstructorCourses = async (instructorId, newCourseIds) => {
    const inst = instructors.find(i => i.id === instructorId);
    if (!inst) return;

    setCourses(prevCourses => prevCourses.map(c => {
      const shouldHave = newCourseIds.includes(c.id);
      const currentIds = c.instructorIds || [];
      const hasInst = currentIds.includes(instructorId);

      if (shouldHave && !hasInst) {
        const updatedCourse = { ...c, instructorIds: [...currentIds, instructorId] };
        saveCourseToSupabase(updatedCourse);
        return updatedCourse;
      } else if (!shouldHave && hasInst) {
        const updatedCourse = { ...c, instructorIds: currentIds.filter(id => id !== instructorId) };
        saveCourseToSupabase(updatedCourse);
        return updatedCourse;
      }
      return c;
    }));

    showToast(`Updated assigned courses for instructor "${inst.name}"`, 'success');
  };

  // Delete individual resource/document permanently (from Cloudflare R2 + Supabase DB)
  const deleteResource = async (resourceId) => {
    const res = resources.find(r => r.id === resourceId) || pendingUploads.find(r => r.id === resourceId);
    if (!res) return;

    setResources(prev => prev.filter(r => r.id !== resourceId));
    setPendingUploads(prev => prev.filter(r => r.id !== resourceId));

    // 1. Delete physical PDF file from Cloudflare R2 Bucket
    if (res.url && res.url.includes('r2.dev')) {
      await deleteFileFromR2(res.url);
    }

    // 2. Delete metadata row from Supabase Database
    await deleteResourceFromSupabase(resourceId);

    showToast(`Deleted document "${res.title}"`, 'info');
  };

  return (
    <ResourceContext.Provider value={{
      currentView,
      navigateTo,
      selectedCourseId,
      selectedInstructorId,
      selectedCategory,
      activeCourse,
      activeInstructor,
      courses,
      instructors,
      resources,
      pendingUploads,
      searchQuery,
      setSearchQuery,
      filteredCourses,
      getInstructorsForCourse,
      getInstructorResources,
      getCategoryResources,
      checkMatchingTitleWarning,
      submitUpload,
      approveUpload,
      rejectUpload,
      addCourse,
      addInstructor,
      checkDuplicateInstructorName,
      deleteCourse,
      deleteInstructor,
      updateCourseDepartment,
      updateInstructorCourses,
      deleteResource,
      incrementDownloads,
      toast,
      showToast
    }}>
      {children}
    </ResourceContext.Provider>
  );
}

export function useResource() {
  const context = useContext(ResourceContext);
  if (!context) {
    throw new Error('useResource must be used within a ResourceProvider');
  }
  return context;
}
