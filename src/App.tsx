import SearchUser from "./pages/searchUser.tsx"
import Login from "./auth/login.tsx"
import { useState } from "react"



function App() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("adminToken"));

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="text-5xl font-bold flex item-center justify-center pt-10 border-b border-grey-300 pb-12">
        Käyttäjien hallintajärjestelmä
      </div>
      <div className="flex flex-row gap-1 justify-center items-center">
        {loggedIn ? (
          <SearchUser />
        ) : (
          <Login onLoggedIn={() => setLoggedIn(true)} />
        )}
      </div>
    </div>
  )
}

export default App

