import { useState } from "react";

export default function SearchInput() {
    const [value, setValue] = useState("");

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        // Tässä kutsut backend-hakua
        console.log("Haetaan:", value);
    }

    return (
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-md pt-3">
            <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Hae käyttäjiä…"
                className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring"
            />
            <button className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700">
                Hae
            </button>
        </form>
    );
}