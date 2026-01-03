import { auth, signIn, signOut } from "@/auth"

export default async function Home() {
  const session = await auth()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-3xl font-bold">Love Project Debug</h1>
      
      {session ? (
        <div className="text-center">
          <p>ยินดีต้อนรับ, {session.user?.name}</p>
          <img 
            src={session.user?.image || ""} 
            alt="Profile" 
            className="w-20 h-20 rounded-full mx-auto my-2"
          />
          <form
            action={async () => {
              "use server"
              await signOut()
            }}
          >
            <button className="bg-red-500 text-white px-4 py-2 rounded">Log Out</button>
          </form>
        </div>
      ) : (
        <form
          action={async () => {
            "use server"
            await signIn("line")
          }}
        >
          <button className="bg-green-500 text-white px-6 py-3 rounded text-xl font-bold">
            Login with Line
          </button>
        </form>
      )}
    </div>
  )
}
