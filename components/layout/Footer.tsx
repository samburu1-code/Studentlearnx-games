export default function Footer() {
  return (
    <footer className="bg-[#0D47A1] text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-bold text-lg">StudentLearnX</p>
            <p className="text-blue-200 text-sm">Smarter Learning for Grades 1–12</p>
          </div>
          <p className="text-blue-300 text-sm">© {new Date().getFullYear()} StudentLearnX. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
