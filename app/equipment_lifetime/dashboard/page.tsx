export default function EquipmentDashboardPage() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-gray-100 p-4">
      <div className="text-center bg-white p-10 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300">
        <div className="text-6xl mb-4 animate-bounce">
          🏗️👷🚧
        </div>
        <h1 className="text-3xl font-bold text-gray-800 animate-bounce">
          Under Development
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          This dashboard is currently being built. Check back soon! :p
        </p>
        <div className="mt-6 text-sm font-mono text-gray-400">
          equipment_lifetime/dashboard
        </div>
      </div>
    </main>
  );
}