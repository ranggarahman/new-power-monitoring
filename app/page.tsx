import Image from "next/image";
import NavCard from "./components/NavCard"; // Import the new component

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col bg-gray-50">
      {/* Your exact header, unchanged */}
      <header className="w-full flex justify-between items-center p-4">
        <Image
          src="/10aris.png"
          alt="Tenaris Logo"
          width={200}
          height={100}
          priority
          className="w-[200px] h-auto" // h-auto is better for aspect ratio
        />
        <div className="text-right text-sm text-gray-600">
          <strong>©️ Maintenance TenarisSPIJ 👷</strong>
          <p className="text-xs text-center">Rangga, May, Joe</p>
        </div>
      </header>

      {/* Main content area, now using NavCard */}
      <div className="flex flex-grow flex-col items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800">
            Central Monitoring Web Navigation Hub
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Select a destination to continue.
          </p>
        </div>

        <nav className="mt-12 flex flex-wrap justify-center gap-6">
          <NavCard
            href="/sparepart"
            icon="⚙️"
            title="Critical Spare Parts Stocks"
          />
          <NavCard
            href="/equipment_lifetime/dashboard"
            icon="📈"
            title="Equipment Lifetime Dashboard"
          />
          <NavCard
            href="/equipment_lifetime/form"
            icon="📝"
            title="Equipment Log Form"
          />
          <NavCard
            href="/power_monitoring"
            icon="⚡️"
            title="Power Monitoring"
          />
        </nav>
      </div>
    </main>
  );
}