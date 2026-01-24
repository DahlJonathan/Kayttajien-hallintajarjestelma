import SearchUser from "./components/searchUser.tsx"




function App() {


  return (
    <div className="min-h-screen bg-slate-100">
      <div className="text-5xl font-bold flex item-center justify-center pt-10 border-b border-grey-300 pb-12">
        Käyttäjien hallintajärjestelmä
      </div>
      <div className="flex flex-row gap-1 justify-center items-center">
        <SearchUser />
      </div>
    </div>
  )
}

export default App
