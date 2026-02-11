const authFetch = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem("adminToken");

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string> || {}),
        "Authorization": `Bearer ${token}`
    };

    const finalOptions: RequestInit = {
        ...options,
        headers
    };

    const res = await fetch(url, finalOptions);

    if (res.status === 401) {
        console.warn("Token vanhentunut tai puuttuu");
    }

    return res;
};

export default authFetch;