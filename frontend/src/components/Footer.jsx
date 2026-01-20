const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-100 mt-10">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center">
          <p className="text-gray-500 text-sm">ProShop &copy; {currentYear}. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
