import React, { useState } from "react";

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
    const [error, setError] = useState("");
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [addForm, setAddForm] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    function selectedSerch(value: Search) {
        setMode(value);
        setOpen(false);
        setHasSearched(false);
    }

    //haku serveriltä hakuvalinnan perusteella
    async function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);
        setHasSearched(true);
        setMessage("");


        try {
            let url = ""

            if (mode === "kaikki") {
                url = `${API}/users`
            }

            if (mode === "id:llä") {
                if (value.trim() === "") {
                    setError("Anna ID");
                    return;
                }

                const id = Number(value);
                if (!Number.isInteger(id) || id <= 0) {
                    setError("ID:n pitää olla positiivinen numero");
                    return;
                }
                url = `${API}/users/${value}`
            }

            if (mode === "nimellä") {
                if (value.trim() === "") {
                    setError("Nimi puuttuu");
                    return;
                }
                url = `${API}/users/search?name=${value}`
            }

            const res = await fetch(url)
            const data = await res.json().catch(() => null)

            if (!res.ok) {
                const msg = data?.message || `Virhe (${res.status})`;
                throw new Error(msg);
            }

            if (mode === "kaikki" || mode === "nimellä") {
                setUsers(data as User[]);
            } else if (mode === "id:llä") {
                setUsers([data as User]);
            }

            setMessage("Käyttäjät haettu");

        } catch (err) {
            const message = err instanceof Error ? err.message : "Tuntematon virhe";
            setError(message);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }

    const addUser = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        setMessage("");



        try {
            const res = await fetch(`${API}/users`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    email,
                }),
            });

            const data = await res.json();

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



    const placeholder = mode === "kaikki" ? "Ei hakusanaa" : mode === "nimellä" ? "Kirjoita nimi" : "Kirjoita id";

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
                                onClick={() => selectedSerch("kaikki")}
                                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                            >
                                Kaikki
                            </button>
                            <button
                                type="button"
                                onClick={() => selectedSerch("nimellä")}
                                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                            >
                                Nimellä
                            </button>
                            <button
                                type="button"
                                onClick={() => selectedSerch("id:llä")}
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

                    {error && (
                        <div className="border border-red-300 bg-red-50 text-red-700 rounded p-2">
                            {error}
                        </div>
                    )}
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
                        {users.map((u) => (
                            <li
                                key={u.id}
                                className="flex justify-between items-center border p-2"
                            >
                                <span>
                                    <span className="font-medium">{u.name}</span>{" "}
                                    <span className="text-gray-700">({u.email})</span>
                                </span>
                                <span className="text-black">#{u.id}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );

}