// Hydrate Redux state from localStorage on client-side only
export const hydrateAuthFromStorage = () => {
    if (typeof window === "undefined") {
        return { token: null, role: null };
    }

    try {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");
        return { token, role };
    } catch (error) {
        console.error("Failed to hydrate auth from localStorage:", error);
        return { token: null, role: null };
    }
};

export const hydrateAdminFromStorage = () => {
    if (typeof window === "undefined") {
        return { admin: null, token: null };
    }

    try {
        const token = localStorage.getItem("adminToken");
        const username = localStorage.getItem("adminUsername");
        const role = localStorage.getItem("adminRole");

        const admin = username && role ? { username, role } : null;
        return { admin, token };
    } catch (error) {
        console.error("Failed to hydrate admin from localStorage:", error);
        return { admin: null, token: null };
    }
};
