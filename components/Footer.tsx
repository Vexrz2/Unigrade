export default function Footer() {

  return (
    <footer className="footer bg-theme3 border-gray-200 py-20">
      <div className="self-center flex justify-around divide-x">
        <div>
          <h1 className="text-xl text-white mb-4">Website made by Ofek Avivi</h1>
          <p className="text-white">I made this website as a project to learn fullstack web development, more specifically on the MERN stack.</p>
          <p className="text-white">As an aspiring web developer, I believe the best way to learn is hands-on, and to build impressive projects.</p>
        </div>
        <div className="flex space-x-5">
          <div className="social-links flex flex-col pl-2">
            <h2 className="text-white text-lg font-bold">Social</h2>
            <div className='github-link py-2 mb-2'>
              <a className='text-white  hover:underline rounded' href="http://github.com/Vexrz2" target="_blank" rel="noreferrer">GitHub</a>
            </div>
            <div className='linkedin-link py-2'>
              <a className='text-white  hover:underline rounded' href="http://linkedin.com/in/ofekavivi" target="_blank" rel="noreferrer">LinkedIn</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
  
};