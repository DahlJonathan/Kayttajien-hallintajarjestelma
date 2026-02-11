import React, { useState, useEffect } from "react";
import Login from "../auth/login";
import authFetch from "../utils/api.ts"

type Search = "kaikki" | "nimellä" | "id:llä";

type User = {
    id: number;
    name: string;
    email: string;
};

const API = "http://localhost:3000"

export default function SearchUser() {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState("");
    const [mode, setMode] = useState<Search>("kaikki");
    const [error, setError] = useState<string | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [addForm, setAddForm] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState("");
    const [editEmail, setEditEmail] = useState("");
    const [page, setPage] = useState(1);
    const pagesize = 5;
    const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("adminToken"));

    useEffect(() => {
        const fetchAll = async () => {
            const res = await authFetch(`${API}/users`);

            // Muuntaa vastauksen json ja jos epäonnistuu palauttaa null
            const data = await res.json().catch(() => null)
            setUsers(data as User[]);
            setPage(1);
            setHasSearched(true);
        };

        fetchAll();
    }, [])

    const selectedSerch = (value: Search) => {
        setMode(value);
        setOpen(false);
        setHasSearched(false);
        setAddForm(false);
        setError("");
        setMessage("");
    }

    const startEdit = (u: User) => {
        setEditingId(u.id);
        setEditName(u.name);
        setEditEmail(u.email);
        setError("");

    };

    // Haku serveriltä hakuvalinnan perusteella
    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        setHasSearched(true);
        setMessage("");
        setAddForm(false);

        try {
            let url = ""

            if (mode === "kaikki") {
                url = `${API}/users`
            }

            if (mode === "id:llä") {
                if (value.trim() === "") {
                    setError("Anna ID");
                    setHasSearched(false);
                    return;
                }

                const id = Number(value);
                if (!Number.isInteger(id) || id <= 0) {
                    setError("ID:n pitää olla positiivinen numero");
                    setHasSearched(false);
                    return;
                }
                url = `${API}/users/${value}`
            }

            if (mode === "nimellä") {
                if (value.trim() === "") {
                    setError("Nimi puuttuu");
                    setHasSearched(false);
                    return;
                }
                url = `${API}/users/search?name=${value}`
            }

            const res = await authFetch(url);

            // Muuntaa vastauksen json ja jos epäonnistuu palauttaa null
            const data = await res.json().catch(() => null)

            if (!res.ok) {
                const msg = data?.message || `Virhe (${res.status})`;
                throw new Error(msg);
            }

            if (mode === "kaikki" || mode === "nimellä") {
                // Palauttaa lista
                setUsers(data as User[]);
                setPage(1);
            } else if (mode === "id:llä") {
                // Palauttaa yksi käyttäjä
                setUsers([data as User]);
                setPage(1);
            }

            if (data.length === 0) {
                setError("Käyttäjää ei löytynyt");
            } else {
                setMessage("Käyttäjät haettu");
            }

        } catch (err) {
            const message = err instanceof Error ? err.message : "Tuntematon virhe";
            setError(message);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }

    const editUser = async () => {
        if (editingId === null) return;

        setLoading(true);
        setError("");

        try {
            const res = await authFetch(`${API}/users/${editingId}`, {
                method: "PUT",
                body: JSON.stringify({
                    name: editName,
                    email: editEmail
                }),
            });

            // Muuntaa vastauksen json jos epäonnistuu palauttaa null
            const data = await res.json().catch(() => null);

            if (!res.ok) {
                const msg = data?.message || `Virhe (${res.status})`;
                throw new Error(msg);
            }

            // Päivitä lista ilman uutta hakua
            setUsers((prev) => prev.map((u) => (u.id === editingId ? data : u)));

            setEditingId(null);
            setMessage("Käyttäjä päivitetty");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Tuntematon virhe");
        } finally {
            setLoading(false);
        }
    };

    const addUser = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        setMessage("");

        try {
            const res = await authFetch(`${API}/users`, {
                method: "POST",
                body: JSON.stringify({
                    name,
                    email,
                }),
            });

            // Muuntaa vastauksen json jos epäonnistuu palauttaa null
            const data = await res.json().catch(() => null);

            if (!res.ok) {
                const msg = data?.message || `Virhe (${res.status})`;
                throw new Error(msg);
            }

            setName("");
            setEmail("");
            setAddForm(false);
            setMessage("Käyttäjä lisätty");

        } catch (err) {
            const message = err instanceof Error ? err.message : "Tuntematon virhe";
            setError(message);
        } finally {
            setLoading(false);
        }
    }

    const deleteUser = async (id: number) => {
        setLoading(true);
        setError("");
        setMessage("");

        try {
            const res = await authFetch(`${API}/users/${id}`, {
                method: "DELETE"
            });

            // Muuntaa vastauksen json jos epäonnistuu palauttaa null
            const data = await res.json().catch(() => null);

            if (!res.ok) {
                const msg = data?.message || `Virhe (${res.status})`;
                throw new Error(msg);
            }

            // Poistaa ilman uutta hakua
            setUsers((prev) => prev.filter((u) => u.id !== id));
            setMessage("Käyttäjä poistettu");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Tuntematon virhe");
        } finally {
            setLoading(false);
        }
    };

    const placeholder = mode === "kaikki" ? "Ei hakusanaa" : mode === "nimellä" ? "Kirjoita nimi" : "Kirjoita id";

    // Laskee kuinka monta sivua tarvitaan kaikkien käyttäjien näyttämiseen.
    const totalPages = Math.max(1, Math.ceil(users.length / pagesize));
    const startIndex = (page - 1) * pagesize;
    const pagedUsers = users.slice(startIndex, startIndex + pagesize);

    if (!loggedIn) {
        return <Login onLoggedIn={() => setLoggedIn(true)} />;
    }

    return (
        <div className="pt-3 space-y-4">
            <div className="flex items-center gap-2">
                {/* Dropdown menu */}
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setOpen(!open)}
                        className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded"
                    >
                        Hae {mode}
                        <span className="text-xs pl-2">▼</span>
                    </button>

                    {open && (
                        <div className="absolute left-0 mt-2 w-36 bg-white border rounded shadow z-10">
                            <button
                                type="button"
                                onClick={() => { selectedSerch("kaikki"); setValue(""); }}
                                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                            >
                                Kaikki
                            </button>
                            <button
                                type="button"
                                onClick={() => { selectedSerch("nimellä"); setValue(""); }}
                                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                            >
                                Nimellä
                            </button>
                            <button
                                type="button"
                                onClick={() => { selectedSerch("id:llä"); setValue(""); }}
                                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                            >
                                Id:llä
                            </button>
                        </div>
                    )}
                </div>

                {/* Hakuform */}
                <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
                    <input
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder={placeholder}
                        disabled={loading || mode === "kaikki"}
                        className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring bg-white disabled:bg-gray-200 disabled:cursor-not-allowed"
                    />
                    <button

                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
                    >
                        {loading ? "Ladataan..." : "Hae"}
                    </button>
                </form>

                <div>
                    <button
                        onClick={() => {
                            setAddForm(true);
                            setHasSearched(false);
                            setMessage("");
                            setError("");
                        }}
                        className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
                    >
                        lisää käyttäjä
                    </button>
                </div>
            </div>

            {message && (
                <div className="text-green-700 text-2xl font-bold mb-3 flex item-center justify-center">
                    {message}
                </div>
            )}

            {/* lisää käyttäjä */}
            {addForm && (
                <form onSubmit={addUser} className="space-y-3 max-w-md">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Nimi
                        </label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full border rounded px-3 py-2"
                            placeholder="Anna nimi"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Sähköposti
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border rounded px-3 py-2"
                            placeholder="anna@example.com"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 rounded bg-green-600 text-white hover:bg-blue-700 disabled:opacity-60"
                    >
                        {loading ? "Tallennetaan..." : "Lisää"}
                    </button>
                    <button
                        onClick={() => {
                            setAddForm(false);
                            setHasSearched(false);
                            setMessage("");
                            setError("");
                            setName("");
                            setEmail("");
                        }}
                        className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 ml-2"
                    >
                        Peruuta
                    </button>
                </form>

            )}

            {/* error viesti */}
            {error && (
                <div className="flex items-center justify-center border border-red-300 bg-red-50 text-red-700 rounded p-3">
                    {error}
                </div>
            )}

            {/* Hakutulokset */}
            {hasSearched && (
                <div>
                    {/* käyttäjä lista */}
                    <ul className="space-y-2">
                        {pagedUsers.map((u) => (
                            <li key={u.id} className="border p-2 rounded flex justify-between items-center">
                                {editingId === u.id ? (
                                    <div className="flex gap-2 items-center">
                                        <input
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="border rounded px-2 py-1 w-42"
                                        />
                                        <input
                                            value={editEmail}
                                            onChange={(e) => setEditEmail(e.target.value)}
                                            className="border rounded px-2 py-1 w-42"
                                        />
                                        <button
                                            type="button"
                                            onClick={editUser}
                                            disabled={loading}
                                            className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                                        >
                                            Tallenna
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setEditingId(null)}
                                            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-60"
                                        >
                                            Peruuta
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div>
                                            <span className="font-medium">{u.name}</span>{" "}
                                            <span className="text-gray-600">({u.email})</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="text-gray-500">#{u.id}</span>
                                            <button
                                                type="button"
                                                onClick={() => startEdit(u)}
                                                className="px-3 py-1 rounded bg-yellow-500 text-white hover:bg-yellow-600 disabled:opacity-60"
                                            >
                                                Muokkaa
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => deleteUser(u.id)}
                                                className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                                            >
                                                Poista
                                            </button>

                                        </div>
                                    </>

                                )}
                            </li>
                        ))}
                    </ul>
                    {users.length > 0 && (
                        <div className="flex items-center justify-between mt-3">
                            <button
                                type="button"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                            >
                                Edellinen
                            </button>

                            <div className="text-sm text-gray-700">
                                Sivu {page} / {totalPages}
                            </div>

                            <button
                                type="button"
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                            >
                                Seuraava
                            </button>
                        </div>
                    )}
                </div>
            )}
            <div className="flex items-center justify-center">
                <button
                    type="button"
                    onClick={() => {
                        localStorage.removeItem("adminToken");
                        setLoggedIn(false);
                    }}
                    className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                >
                    logout
                </button>
            </div>
        </div>
    );

}

