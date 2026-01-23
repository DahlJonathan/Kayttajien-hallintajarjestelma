import { useState } from "react";

type Search = "kaikki" | "nimellä" | "id:llä";

export default function Dropdown() {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState<Search>("kaikki");

    function selectedSerch(value: Search) {
        setSearch(value);
        setOpen(false);
    }



    return (
        <div className="relative inline-block pt-3 pr-1">
            <button
                onClick={() => setOpen(!open)}
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded"
            >
                Hae {search}
                <span className="text-xs pl-2">▼</span>
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-30 bg-white border rounded shadow">
                    <button
                        onClick={() => selectedSerch("kaikki")}
                        className="block w-full text-left px-4 py-2 hover:bg-grey-100">
                        Kaikki
                    </button>
                    <button
                        onClick={() => selectedSerch("nimellä")}
                        className="block w-full text-left px-4 py-2 hover:bg-grey-100">
                        Nimellä
                    </button>
                    <button
                        onClick={() => selectedSerch("id:llä")}
                        className="block w-full text-left px-4 py-2 hover:bg-grey-100">
                        Id:llä
                    </button>
                </div>
            )}
        </div>
    );
}