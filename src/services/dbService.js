// Supabase Database Sync Service
import { supabase, isSupabaseConnected } from './cloudStorage';

/**
 * Fetch all shared resources stored in Supabase SQL Database
 */
export async function fetchResourcesFromSupabase() {
  if (!isSupabaseConnected || !supabase) return [];

  try {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetch error (resources):', error.message);
      return [];
    }

    return (data || []).map(row => ({
      id: row.id,
      title: row.title,
      category: row.category,
      courseId: row.course_id,
      instructorId: row.instructor_id,
      examType: row.exam_type,
      semesterSession: row.semester_session,
      fileSize: row.file_size,
      fileType: row.file_type,
      uploaderName: row.uploader_name,
      url: row.url,
      downloadsCount: row.downloads_count || 0,
      status: row.status ? row.status : (String(row.id).startsWith('upload-') || String(row.id).startsWith('pending-') ? 'pending' : 'approved'),
      createdAt: row.created_at ? new Date(row.created_at).toLocaleDateString() : new Date().toLocaleDateString()
    }));
  } catch (err) {
    console.error('Failed to load resources from Supabase:', err);
    return [];
  }
}

/**
 * Save a newly uploaded resource record to Supabase SQL Database
 */
export async function saveResourceToSupabase(resource) {
  if (!isSupabaseConnected || !supabase || !resource) return false;

  try {
    const dbPayload = {
      id: String(resource.id),
      title: resource.title,
      category: resource.category,
      course_id: resource.courseId || null,
      instructor_id: resource.instructorId || null,
      exam_type: resource.examType || null,
      semester_session: resource.semesterSession || null,
      file_size: resource.fileSize || '1.5 MB',
      file_type: resource.fileType || 'pdf',
      uploader_name: resource.uploaderName || 'Student',
      url: (resource.url && resource.url.startsWith('data:')) ? '' : (resource.url || ''),
      status: resource.status || (String(resource.id).startsWith('upload-') ? 'pending' : 'approved'),
      downloads_count: resource.downloadsCount || 0,
      created_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('resources')
      .upsert([dbPayload], { onConflict: 'id' });

    if (error) {
      throw error;
    }

    console.log('Successfully saved resource metadata to Supabase DB!');
    return true;
  } catch (err) {
    console.error('Failed to save resource to Supabase:', err);
    return false;
  }
}

/**
 * Batch sync all local resources to Supabase
 */
export async function syncAllResourcesToSupabase(resourcesList) {
  if (!isSupabaseConnected || !supabase || !resourcesList || resourcesList.length === 0) return;

  try {
    const payloads = resourcesList.map(resource => ({
      id: String(resource.id),
      title: resource.title,
      category: resource.category,
      course_id: resource.courseId || null,
      instructor_id: resource.instructorId || null,
      exam_type: resource.examType || null,
      semester_session: resource.semesterSession || null,
      file_size: resource.fileSize || '1.5 MB',
      file_type: resource.fileType || 'pdf',
      uploader_name: resource.uploaderName || 'Student',
      url: resource.url || '',
      status: resource.status || 'approved',
      downloads_count: resource.downloadsCount || 0,
      created_at: new Date().toISOString()
    }));

    const { error } = await supabase.from('resources').upsert(payloads, { onConflict: 'id' });
    if (!error) {
      console.log(`[COMSATS Vault] Successfully synced ${resourcesList.length} resources to Supabase DB!`);
    } else {
      console.warn('[COMSATS Vault] Resource sync warning:', error.message);
    }
  } catch (e) {
    console.error('Failed to sync resources to Supabase:', e);
  }
}


/**
 * Increment downloads count in Supabase
 */
export async function incrementDownloadsInSupabase(resourceId) {
  if (!isSupabaseConnected || !supabase || !resourceId) return;

  try {
    const { data } = await supabase
      .from('resources')
      .select('downloads_count')
      .eq('id', String(resourceId))
      .single();

    const currentCount = data?.downloads_count || 0;

    await supabase
      .from('resources')
      .update({ downloads_count: currentCount + 1 })
      .eq('id', String(resourceId));
  } catch (err) {
    console.warn('Failed to increment download count in Supabase:', err);
  }
}

/**
 * Fetch custom courses from Supabase
 */
export async function fetchCoursesFromSupabase() {
  if (!isSupabaseConnected || !supabase) return [];

  try {
    const { data, error } = await supabase.from('courses').select('*');
    if (error) return [];
    return (data || []).map(c => ({
      id: c.id,
      code: c.code,
      title: c.title,
      abbreviation: c.abbreviation,
      aliases: Array.isArray(c.aliases) ? c.aliases : [],
      department: c.department,
      semester: c.semester || 1,
      creditHours: c.credit_hours || 3,
      description: c.description,
      iconName: c.icon_name || 'BookOpen',
      instructorIds: Array.isArray(c.instructor_ids) ? c.instructor_ids : []
    }));
  } catch (e) {
    return [];
  }
}

/**
 * Save new course to Supabase
 */
export async function saveCourseToSupabase(course) {
  if (!isSupabaseConnected || !supabase || !course) return false;

  try {
    const payload = {
      id: course.id,
      code: course.code,
      title: course.title,
      abbreviation: course.abbreviation || '',
      aliases: course.aliases || [],
      department: course.department || '',
      semester: course.semester || 1,
      credit_hours: course.creditHours || 3,
      description: course.description || '',
      icon_name: course.iconName || 'BookOpen',
      instructor_ids: course.instructorIds || []
    };

    await supabase.from('courses').upsert([payload], { onConflict: 'id' });
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Fetch custom instructors from Supabase
 */
export async function fetchInstructorsFromSupabase() {
  if (!isSupabaseConnected || !supabase) return [];

  try {
    const { data, error } = await supabase.from('instructors').select('*');
    if (error) return [];
    return (data || []).map(i => ({
      id: i.id,
      name: i.name,
      title: i.title,
      department: i.department,
      email: i.email,
      office: i.office,
      specialization: i.specialization,
      rating: parseFloat(i.rating) || 5.0,
      avatarUrl: i.avatar_url
    }));
  } catch (e) {
    return [];
  }
}

/**
 * Save new instructor to Supabase
 */
export async function saveInstructorToSupabase(instructor) {
  if (!isSupabaseConnected || !supabase || !instructor) return false;

  try {
    const payload = {
      id: instructor.id,
      name: instructor.name,
      title: instructor.title || '',
      department: instructor.department || '',
      email: instructor.email || '',
      office: instructor.office || '',
      specialization: instructor.specialization || '',
      rating: instructor.rating || 5.0,
      avatar_url: instructor.avatarUrl || ''
    };

    await supabase.from('instructors').upsert([payload], { onConflict: 'id' });
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Batch sync all local courses to Supabase
 */
export async function syncAllCoursesToSupabase(coursesList) {
  if (!isSupabaseConnected || !supabase || !coursesList || coursesList.length === 0) return;

  try {
    const payloads = coursesList.map(course => ({
      id: course.id,
      code: course.code,
      title: course.title,
      abbreviation: course.abbreviation || '',
      aliases: course.aliases || [],
      department: course.department || '',
      semester: course.semester || 1,
      credit_hours: course.creditHours || 3,
      description: course.description || '',
      icon_name: course.iconName || 'BookOpen',
      instructor_ids: course.instructorIds || []
    }));

    const { error } = await supabase.from('courses').upsert(payloads, { onConflict: 'id' });
    if (!error) {
      console.log(`[COMSATS Vault] Successfully synced ${coursesList.length} courses to Supabase DB!`);
    } else {
      console.warn('[COMSATS Vault] Course sync warning:', error.message);
    }
  } catch (e) {
    console.error('Failed to sync courses to Supabase:', e);
  }
}

/**
 * Batch sync all local instructors to Supabase
 */
export async function syncAllInstructorsToSupabase(instructorsList) {
  if (!isSupabaseConnected || !supabase || !instructorsList || instructorsList.length === 0) return;

  try {
    const payloads = instructorsList.map(instructor => ({
      id: instructor.id,
      name: instructor.name,
      title: instructor.title || '',
      department: instructor.department || '',
      email: instructor.email || '',
      office: instructor.office || '',
      specialization: instructor.specialization || '',
      rating: instructor.rating || 5.0,
      avatar_url: instructor.avatarUrl || ''
    }));

    const { error } = await supabase.from('instructors').upsert(payloads, { onConflict: 'id' });
    if (!error) {
      console.log(`[COMSATS Vault] Successfully synced ${instructorsList.length} instructors to Supabase DB!`);
    } else {
      console.warn('[COMSATS Vault] Instructor sync warning:', error.message);
    }
  } catch (e) {
    console.error('Failed to sync instructors to Supabase:', e);
  }
}

/**
 * Delete course from Supabase DB
 */
export async function deleteCourseFromSupabase(courseId) {
  if (!isSupabaseConnected || !supabase || !courseId) return false;
  try {
    const { error } = await supabase.from('courses').delete().eq('id', String(courseId));
    if (error) throw error;
    console.log(`[COMSATS Vault] Successfully deleted course ${courseId} from Supabase DB`);
    return true;
  } catch (e) {
    console.error('Failed to delete course from Supabase:', e);
    return false;
  }
}

/**
 * Delete instructor from Supabase DB
 */
export async function deleteInstructorFromSupabase(instructorId) {
  if (!isSupabaseConnected || !supabase || !instructorId) return false;
  try {
    const { error } = await supabase.from('instructors').delete().eq('id', String(instructorId));
    if (error) throw error;
    console.log(`[COMSATS Vault] Successfully deleted instructor ${instructorId} from Supabase DB`);
    return true;
  } catch (e) {
    console.error('Failed to delete instructor from Supabase:', e);
    return false;
  }
}

/**
 * Delete resource from Supabase DB
 */
export async function deleteResourceFromSupabase(resourceId) {
  if (!isSupabaseConnected || !supabase || !resourceId) return false;
  try {
    const { error } = await supabase.from('resources').delete().eq('id', String(resourceId));
    if (error) throw error;
    console.log(`[COMSATS Vault] Successfully deleted resource ${resourceId} from Supabase DB`);
    return true;
  } catch (e) {
    console.error('Failed to delete resource from Supabase:', e);
    return false;
  }
}


