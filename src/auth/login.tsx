import { useState } from "react";

const API = "http://localhost:3000";

type Props = {
    onLoggedIn?: () => void;
};

export default function Login({ onLoggedIn }: Props) {
    const [loginName, setLoginName] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
        // Pysäyttää selaimen päivittämistä niin react hoitaa sen
        e.preventDefault();
        setMessage("");
        setLoading(true);

        try {
            // Lähettää käyttäjänimi ja salasana backendiin joka tarkistaan niitä ja palauttaa token
            const res = await fetch(`${API}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: loginName,
                    password: password,
                }),
            });

            // Muuntaa vastauksen json jos epäonnistuu palauttaa null
            const data: any = await res.json().catch(() => ({}));

            if (!res.ok) {
                setMessage(data?.message || `Virhe (${res.status})`);
                return;
            }
            // Tallentaa token localstorage
            localStorage.setItem("adminToken", data.accessToken);
            onLoggedIn?.();
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Tuntematon virhe";
            setMessage(msg);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col items-center justify-center gap-4 mt-10">
            <form onSubmit={handleLogin} className="flex flex-col gap-2">
                <div className="text-3xl">Kirjaudu sisään</div>

                <input
                    className="border p-2 rounded"
                    type="text"
                    value={loginName}
                    onChange={(e) => setLoginName(e.target.value)}
                    placeholder="käyttäjätunnus"
                />

                <input
                    className="border p-2 rounded"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="salasana"
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-60"
                >
                    {loading ? "Kirjaudutaan..." : "Kirjaudu sisään"}
                </button>
                {message && <p className="text-red-600">{message}</p>}
            </form>
        </div>
    );
}

