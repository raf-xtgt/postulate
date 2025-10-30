import ClientProfileListing from "../clientProfile/clientProfileListing";
import SessionListing from "../session/sessionListing";

export default function Home() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-semibold">Total Sessions</h2>
          <p className="text-3xl">1,234</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-semibold">Successful Sessions</h2>
          <p className="text-3xl">5</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-semibold">Failed Sessions</h2>
          <p className="text-3xl">23</p>
        </div>
      </div>
      <div className="p-4">
        <SessionListing />
      </div>
    </div>
  );
}