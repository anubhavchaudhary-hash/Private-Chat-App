import { db } from './firebase';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';

/**
 * Get the custom display name that currentUser has set for contactUser
 * @param currentUserId The ID of the user viewing the chat
 * @param contactUserId The ID of the other user
 * @returns Custom name if set, otherwise null
 */
export const getCustomName = async (currentUserId: string, contactUserId: string): Promise<string | null> => {
    try {
        const docRef = doc(db, 'customNames', currentUserId, 'contacts', contactUserId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            return docSnap.data().customName || null;
        }
        return null;
    } catch (error) {
        console.error('Error fetching custom name:', error);
        return null;
    }
};

/**
 * Set a custom display name for a contact
 * @param currentUserId The ID of the user setting the custom name
 * @param contactUserId The ID of the contact to rename
 * @param customName The custom display name
 */
export const setCustomName = async (currentUserId: string, contactUserId: string, customName: string): Promise<void> => {
    try {
        const docRef = doc(db, 'customNames', currentUserId, 'contacts', contactUserId);
        await setDoc(docRef, {
            customName: customName.trim(),
            updatedAt: new Date().getTime()
        });
    } catch (error) {
        console.error('Error setting custom name:', error);
        throw error;
    }
};

/**
 * Remove the custom display name for a contact (revert to default)
 * @param currentUserId The ID of the user removing the custom name
 * @param contactUserId The ID of the contact
 */
export const removeCustomName = async (currentUserId: string, contactUserId: string): Promise<void> => {
    try {
        const docRef = doc(db, 'customNames', currentUserId, 'contacts', contactUserId);
        await deleteDoc(docRef);
    } catch (error) {
        console.error('Error removing custom name:', error);
        throw error;
    }
};
