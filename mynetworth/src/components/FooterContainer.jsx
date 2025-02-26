const FooterContainer = () => {
  return (
    <div className="bg-black text-white w-screen py-8 px-6">
      {/* Top Section: Two Columns */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Brand Name */}
        <div>
          <h2 className="text-2xl font-semibold">MyNetworth</h2>
        </div>

        {/* Right Column: Contact Us */}
        <div className="text-right">
          <h3 className="text-lg font-medium">Contact Us</h3>
          <p className="text-gray-400">Email: support@mynetworth.com</p>
          <p className="text-gray-400">Phone: +1 (123) 456-7890</p>
        </div>
      </div>

      {/* Bottom Section: Legal Links & Copyright */}
      <div className="max-w-7xl mx-auto mt-6 flex flex-col md:flex-row items-center justify-between text-gray-500 text-sm border-t border-gray-700 pt-4">
        {/* Left: Terms & Policies */}
        <div className="flex gap-4">
          <a href="#" className="hover:text-white transition">
            Terms & Conditions
          </a>
          <a href="#" className="hover:text-white transition">
            Privacy Policy
          </a>
        </div>

        {/* Right: Copyright Info */}
        <p className="mt-4 md:mt-0">
          &copy; 2025 MyNetworth. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default FooterContainer;
