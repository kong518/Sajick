import { ResignationFormData } from '../types';
import { sampleSampleFormData } from '../data/sampleData';

const SUBMISSIONS_KEY = 'suwon_rehab_resignation_submissions_v1';
const DRAFT_KEY = 'suwon_rehab_resignation_draft_v1';

export const loadSubmissions = (): ResignationFormData[] => {
  try {
    const raw = localStorage.getItem(SUBMISSIONS_KEY);
    if (!raw) {
      // Seed with sample data so users can immediately test review and print
      const initial = [sampleSampleFormData];
      localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load submissions from localStorage:', err);
    return [sampleSampleFormData];
  }
};

export const saveSubmission = (form: ResignationFormData): void => {
  try {
    const list = loadSubmissions();
    const existingIndex = list.findIndex((item) => item.id === form.id);
    const updatedForm: ResignationFormData = {
      ...form,
      status: 'submitted',
      submittedAt: form.submittedAt || new Date().toISOString(),
    };

    let nextList: ResignationFormData[];
    if (existingIndex >= 0) {
      nextList = [...list];
      nextList[existingIndex] = updatedForm;
    } else {
      nextList = [updatedForm, ...list];
    }
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(nextList));
    // Clear current draft
    localStorage.removeItem(DRAFT_KEY);
  } catch (err) {
    console.error('Failed to save submission:', err);
  }
};

export const updateSubmissionInStorage = (updated: ResignationFormData): void => {
  try {
    const list = loadSubmissions();
    const nextList = list.map((item) => (item.id === updated.id ? updated : item));
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(nextList));
  } catch (err) {
    console.error('Failed to update submission:', err);
  }
};

export const deleteSubmissionFromStorage = (id: string): void => {
  try {
    const list = loadSubmissions();
    const nextList = list.filter((item) => item.id !== id);
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(nextList));
  } catch (err) {
    console.error('Failed to delete submission:', err);
  }
};

export const saveDraft = (form: ResignationFormData): void => {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
  } catch (err) {
    console.warn('Failed to save draft:', err);
  }
};

export const loadDraft = (): ResignationFormData | null => {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Failed to load draft:', err);
  }
  return null;
};

export const clearDraft = (): void => {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch (err) {
    console.warn('Failed to clear draft:', err);
  }
};
